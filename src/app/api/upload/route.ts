import { NextRequest, NextResponse } from 'next/server'
import { parseSummaryTab } from '@/lib/parseWorkbook'
import { parseGranularTabs } from '@/lib/parseReports'

export const runtime = 'nodejs'
export const maxDuration = 60

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
    if (monthOverride) summaryResult.detectedMonth = monthOverride

    const granularResult = parseGranularTabs(buffer)

    return NextResponse.json({
      detectedMonth: summaryResult.detectedMonth,
      filename: file.name,
      matchedCount: summaryResult.matchedMetrics.length,
      unmatchedLabels: summaryResult.unmatchedLabels,
      warnings: [...summaryResult.warnings, ...granularResult.warnings],
      granularCounts: {
        orders: granularResult.orders.length,
        shopifySales: granularResult.shopifySales.length,
        adPerformance: granularResult.adPerformance.length,
        tiktokAffiliates: granularResult.tiktokAffiliates.length,
        tiktokGmvSpend: granularResult.tiktokGmvSpend.length,
        inventoryLedger: granularResult.inventoryLedger.length,
        delivery: granularResult.delivery.length,
        searchQuery: granularResult.searchQuery.length,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
