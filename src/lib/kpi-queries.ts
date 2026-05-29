import { supabaseAdmin } from './supabase'
import { METRICS } from './metrics'

export interface MonthRow {
  id: string
  period: string
  label: string
  quarter: string
  source_filename?: string
  uploaded_at?: string
}

export interface KpiValueRow {
  month_id: string
  metric_key: string
  value: number | null
  sku?: string | null
  period?: string
  label?: string
  quarter?: string
}

export async function getLatestMonth(): Promise<MonthRow | null> {
  const { data } = await supabaseAdmin
    .from('months')
    .select('*')
    .order('period', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getAllMonths(): Promise<MonthRow[]> {
  const { data } = await supabaseAdmin
    .from('months')
    .select('id, period, label, quarter, source_filename, uploaded_at')
    .order('period', { ascending: false })
  return data ?? []
}

export async function getScorecardData(monthCount = 6) {
  const scorecardKeys = METRICS.filter(m => m.section === 'scorecard').map(m => m.key)

  const { data: months } = await supabaseAdmin
    .from('months')
    .select('id, period, label, quarter')
    .order('period', { ascending: false })
    .limit(monthCount)

  if (!months?.length) return { months: [], values: [] }

  const monthIds = months.map(m => m.id)
  const { data: values } = await supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value, sku')
    .in('month_id', monthIds)
    .in('metric_key', scorecardKeys)
    .is('sku', null)

  return { months: [...months].reverse(), values: values ?? [] }
}

export async function getMonthDetail(monthId: string) {
  const { data: month } = await supabaseAdmin
    .from('months')
    .select('*')
    .eq('id', monthId)
    .single()

  if (!month) return null

  const { data: values } = await supabaseAdmin
    .from('latest_kpi_values')
    .select('metric_key, sku, value, raw_text')
    .eq('month_id', monthId)

  return { month, values: values ?? [] }
}

export async function getGoalsForQuarter(quarter: string) {
  const { data } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('quarter', quarter)
  return data ?? []
}

export async function getMetricTrend(
  metricKeys: string[],
  fromPeriod?: string,
  toPeriod?: string,
): Promise<KpiValueRow[]> {
  let query = supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value, sku, period, label, quarter')
    .in('metric_key', metricKeys)
    .is('sku', null)
    .order('period', { ascending: true })

  if (fromPeriod) query = query.gte('period', `${fromPeriod}-01`)
  if (toPeriod) query = query.lte('period', `${toPeriod}-01`)

  const { data } = await query
  return (data as KpiValueRow[]) ?? []
}

export async function getChannelData(channel: string, monthCount = 6) {
  const channelKeys = METRICS.filter(m => m.channel === channel).map(m => m.key)
  if (!channelKeys.length) return { months: [], values: [] }

  const { data: months } = await supabaseAdmin
    .from('months')
    .select('id, period, label')
    .order('period', { ascending: false })
    .limit(monthCount)

  if (!months?.length) return { months: [], values: [] }

  const monthIds = months.map(m => m.id)
  const { data: values } = await supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value, sku, period, label')
    .in('month_id', monthIds)
    .in('metric_key', channelKeys)

  return { months: [...months].reverse(), values: values ?? [] }
}

export async function getQuarterlyPacing(quarter: string) {
  const goals = await getGoalsForQuarter(quarter)
  const scorecardKeys = METRICS.filter(m => m.section === 'scorecard').map(m => m.key)

  const [year, q] = quarter.split('-Q')
  const qNum = parseInt(q)
  const startMonth = (qNum - 1) * 3 + 1
  const endMonth = qNum * 3
  const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`
  const endDate = `${year}-${String(endMonth).padStart(2, '0')}-01`

  const { data: quarterMonths } = await supabaseAdmin
    .from('months')
    .select('id, period, label')
    .gte('period', startDate)
    .lte('period', endDate)
    .order('period', { ascending: true })

  if (!quarterMonths?.length) return { goals, quarterMonths: [], values: [] }

  const monthIds = quarterMonths.map(m => m.id)
  const { data: values } = await supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value')
    .in('month_id', monthIds)
    .in('metric_key', scorecardKeys)
    .is('sku', null)

  return { goals, quarterMonths, values: values ?? [] }
}

export async function getSectionData(section: string, monthCount = 6) {
  const sectionKeys = METRICS.filter(m => m.section === section).map(m => m.key)

  const { data: months } = await supabaseAdmin
    .from('months')
    .select('id, period, label, quarter')
    .order('period', { ascending: false })
    .limit(monthCount)

  if (!months?.length) return { months: [], values: [] }

  const monthIds = months.map(m => m.id)
  const { data: values } = await supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value, sku, period, label')
    .in('month_id', monthIds)
    .in('metric_key', sectionKeys)

  return { months: [...months].reverse(), values: values ?? [] }
}
