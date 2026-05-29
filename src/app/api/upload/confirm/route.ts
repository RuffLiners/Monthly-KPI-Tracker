import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { parseSummaryTab } from '@/lib/parseWorkbook'
import { parseGranularTabs } from '@/lib/parseReports'
import { format } from 'date-fns'

export const runtime = 'nodejs'
export const maxDuration = 120

async function batchInsert<T extends object>(
  table: string,
  rows: T[],
  chunkSize = 500,
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabaseAdmin.from(table).insert(chunk)
    if (error) throw new Error(`Insert error for ${table}: ${error.message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const monthOverride = formData.get('month') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const summaryResult = parseSummaryTab(buffer, file.name)
    const granularResult = parseGranularTabs(buffer)

    const monthStr = monthOverride ?? summaryResult.detectedMonth
    if (!monthStr) {
      return NextResponse.json(
        { error: 'Could not detect month from filename. Please provide a month override.' },
        { status: 400 },
      )
    }

    const [year, month] = monthStr.split('-')
    const period = `${year}-${month}-01`
    const qNum = Math.ceil(parseInt(month) / 3)
    const quarter = `${year}-Q${qNum}`
    const label = format(
      new Date(parseInt(year), parseInt(month) - 1, 1),
      'MMMM yyyy',
    )

    // Upload to Storage
    const storagePath = `kpi-uploads/${monthStr}/${file.name}`
    const { error: storageError } = await supabaseAdmin.storage
      .from('kpi-workbooks')
      .upload(storagePath, buffer, {
        upsert: true,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

    if (storageError && !storageError.message.includes('already exists')) {
      console.warn('Storage upload warning:', storageError.message)
    }

    // Upsert month
    const { data: monthRow, error: monthError } = await supabaseAdmin
      .from('months')
      .upsert(
        { period, label, quarter, source_filename: file.name },
        { onConflict: 'period' },
      )
      .select()
      .single()

    if (monthError || !monthRow) {
      return NextResponse.json(
        { error: `Failed to upsert month: ${monthError?.message}` },
        { status: 500 },
      )
    }

    const monthId = (monthRow as { id: string }).id

    // Get next version
    const { data: existingVersions } = await supabaseAdmin
      .from('kpi_values')
      .select('version')
      .eq('month_id', monthId)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion =
      existingVersions?.length
        ? (existingVersions[0] as { version: number }).version + 1
        : 1

    // Insert KPI values
    const kpiRows = summaryResult.matchedMetrics.map(m => ({
      month_id: monthId,
      metric_key: m.metricKey,
      sku: m.sku ?? null,
      value: m.value,
      raw_text: m.rawText,
      version: nextVersion,
    }))

    await batchInsert('kpi_values', kpiRows)

    // Insert granular data
    const addMonthId = <T extends object>(rows: T[]) =>
      rows.map(r => ({ ...r, month_id: monthId }))

    if (granularResult.orders.length)
      await batchInsert('orders', addMonthId(granularResult.orders))
    if (granularResult.shopifySales.length)
      await batchInsert('shopify_sales', addMonthId(granularResult.shopifySales))
    if (granularResult.adPerformance.length)
      await batchInsert('ad_performance', addMonthId(granularResult.adPerformance))
    if (granularResult.tiktokAffiliates.length)
      await batchInsert('tiktok_affiliates', addMonthId(granularResult.tiktokAffiliates))
    if (granularResult.tiktokGmvSpend.length)
      await batchInsert('tiktok_gmv_spend', addMonthId(granularResult.tiktokGmvSpend))
    if (granularResult.inventoryLedger.length)
      await batchInsert('inventory_ledger', addMonthId(granularResult.inventoryLedger))
    if (granularResult.delivery.length)
      await batchInsert('delivery', addMonthId(granularResult.delivery))
    if (granularResult.searchQuery.length)
      await batchInsert('search_query', addMonthId(granularResult.searchQuery))

    // Log upload
    await supabaseAdmin.from('upload_log').insert({
      month_id: monthId,
      filename: file.name,
      storage_path: storagePath,
      matched_metrics: summaryResult.matchedMetrics.length,
      unmatched_labels: summaryResult.unmatchedLabels,
      parse_warnings: [...summaryResult.warnings, ...granularResult.warnings],
      granular_rows_inserted: {
        orders: granularResult.orders.length,
        shopify_sales: granularResult.shopifySales.length,
        ad_performance: granularResult.adPerformance.length,
        tiktok_affiliates: granularResult.tiktokAffiliates.length,
        tiktok_gmv_spend: granularResult.tiktokGmvSpend.length,
        inventory_ledger: granularResult.inventoryLedger.length,
        delivery: granularResult.delivery.length,
        search_query: granularResult.searchQuery.length,
      },
    })

    return NextResponse.json({
      success: true,
      monthId,
      period: monthStr,
      label,
      matchedMetrics: summaryResult.matchedMetrics.length,
      unmatchedLabels: summaryResult.unmatchedLabels,
      version: nextVersion,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
