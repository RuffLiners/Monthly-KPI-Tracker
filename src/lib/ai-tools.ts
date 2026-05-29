import { z } from 'zod'
import { supabaseAdmin } from './supabase'
import { METRICS } from './metrics'

// Whitelists for query_granular
const ALLOWED_TABLES = new Set([
  'orders',
  'shopify_sales',
  'ad_performance',
  'tiktok_affiliates',
  'tiktok_gmv_spend',
  'inventory_ledger',
  'delivery',
  'search_query',
])

const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  orders:            new Set(['sku', 'asin', 'sales_channel', 'fulfillment_channel', 'order_status', 'purchase_date']),
  shopify_sales:     new Set(['sku', 'sales_channel']),
  ad_performance:    new Set(['platform', 'ad_type', 'campaign', 'ad_group', 'sku', 'asin']),
  tiktok_affiliates: new Set(['creator_name']),
  tiktok_gmv_spend:  new Set(['campaign', 'product_id', 'video_title']),
  inventory_ledger:  new Set(['sku', 'asin', 'msku', 'disposition', 'ledger_date']),
  delivery:          new Set(['shipping_region']),
  search_query:      new Set(['platform', 'keyword']),
}

const ALLOWED_METRICS: Record<string, Set<string>> = {
  orders:            new Set(['quantity', 'item_price']),
  shopify_sales:     new Set(['gross_sales', 'quantity_ordered', 'quantity_returned', 'returns', 'net_sales', 'total_sales']),
  ad_performance:    new Set(['impressions', 'clicks', 'spend', 'sales', 'units', 'cpc', 'ctr']),
  tiktok_affiliates: new Set(['gmv', 'refunds', 'attributed_orders', 'items_sold', 'aov', 'videos', 'est_commission', 'samples_shipped']),
  tiktok_gmv_spend:  new Set(['cost', 'sku_orders', 'cost_per_order', 'gross_revenue']),
  inventory_ledger:  new Set(['starting_balance', 'receipts', 'customer_shipments', 'customer_returns', 'stockout_days', 'days_of_supply']),
  delivery:          new Set(['fulfillment_hours', 'orders_delivered', 'orders_over_2_days', 'orders_over_5_days']),
  search_query:      new Set(['search_volume', 'impressions', 'clicks', 'purchases']),
}

export const ListMonthsInputSchema = z.object({})

export const GetKpiValuesInputSchema = z.object({
  metrics: z.array(z.string()).optional(),
  months: z.array(z.string()).optional(),
})

export const ComparePeriodsInputSchema = z.object({
  metric: z.string(),
  from: z.string(),
  to: z.string(),
  sku: z.string().optional(),
})

export const QueryGranularInputSchema = z.object({
  table: z.enum([
    'orders',
    'shopify_sales',
    'ad_performance',
    'tiktok_affiliates',
    'tiktok_gmv_spend',
    'inventory_ledger',
    'delivery',
    'search_query',
  ]),
  month_range: z.object({ from: z.string(), to: z.string() }).optional(),
  group_by: z.array(z.string()).max(3),
  metrics: z.array(z.string()).max(5),
  filters: z.record(z.union([z.string(), z.number(), z.array(z.string())])).optional(),
  order_by: z.string().optional(),
  order_direction: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(500).default(25),
})

export const RunReadonlySqlInputSchema = z.object({
  sql: z.string().max(2000),
})

export async function execListMonths() {
  const { data } = await supabaseAdmin
    .from('months')
    .select('id, period, label, quarter, source_filename')
    .order('period', { ascending: false })
  return { months: data ?? [] }
}

export async function execGetKpiValues(
  input: z.infer<typeof GetKpiValuesInputSchema>,
) {
  const scorecardKeys = METRICS.filter(m => m.section === 'scorecard').map(m => m.key)
  const metricKeys = input.metrics ?? scorecardKeys

  let query = supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, metric_key, value, sku, period, label, quarter')
    .in('metric_key', metricKeys)
    .is('sku', null)
    .order('period', { ascending: true })

  if (input.months?.length) {
    const periods = input.months.map(m => `${m}-01`)
    query = query.in('period', periods)
  } else {
    query = query.limit(metricKeys.length * 6)
  }

  const { data } = await query
  return {
    values: data ?? [],
    metricDefs: METRICS.filter(m => metricKeys.includes(m.key)).map(m => ({
      key: m.key,
      label: m.label,
      unit: m.unit,
      lowerIsBetter: m.lowerIsBetter,
    })),
  }
}

export async function execComparePeriods(
  input: z.infer<typeof ComparePeriodsInputSchema>,
) {
  const metricDef = METRICS.find(m => m.key === input.metric)
  if (!metricDef) return { error: `Unknown metric key: ${input.metric}` }

  const { data: months } = await supabaseAdmin
    .from('months')
    .select('id, period')
    .in('period', [`${input.from}-01`, `${input.to}-01`])

  if (!months?.length) return { error: 'One or both months not found' }

  const monthMap = Object.fromEntries(
    months.map(m => [m.period.slice(0, 7), m.id]),
  )
  const fromId = monthMap[input.from]
  const toId = monthMap[input.to]

  if (!fromId || !toId) {
    return { error: `Missing data for ${!fromId ? input.from : input.to}` }
  }

  let valQuery = supabaseAdmin
    .from('latest_kpi_values')
    .select('month_id, value')
    .eq('metric_key', input.metric)
    .in('month_id', [fromId, toId])

  if (input.sku) {
    valQuery = valQuery.eq('sku', input.sku)
  } else {
    valQuery = valQuery.is('sku', null)
  }

  const { data: values } = await valQuery
  const fromVal = values?.find(v => v.month_id === fromId)?.value ?? null
  const toVal = values?.find(v => v.month_id === toId)?.value ?? null

  const delta = fromVal !== null && toVal !== null ? toVal - fromVal : null
  const pctChange =
    fromVal !== null && toVal !== null && fromVal !== 0
      ? (toVal - fromVal) / Math.abs(fromVal)
      : null
  const isImprovement =
    delta !== null
      ? metricDef.lowerIsBetter
        ? delta < 0
        : delta > 0
      : null

  return {
    metric: {
      key: input.metric,
      label: metricDef.label,
      unit: metricDef.unit,
      lowerIsBetter: metricDef.lowerIsBetter,
    },
    from: { period: input.from, value: fromVal },
    to: { period: input.to, value: toVal },
    delta,
    pctChange,
    isImprovement,
  }
}

export async function execQueryGranular(
  input: z.infer<typeof QueryGranularInputSchema>,
) {
  const { table, group_by, metrics, filters, month_range, order_by, order_direction, limit } = input

  const allowedCols = ALLOWED_COLUMNS[table]
  const allowedMetrics = ALLOWED_METRICS[table]

  // Strict whitelist check
  for (const col of group_by) {
    if (!allowedCols.has(col)) {
      return { error: `Column '${col}' not allowed for table '${table}'` }
    }
  }
  for (const m of metrics) {
    if (!allowedMetrics.has(m)) {
      return { error: `Metric '${m}' not allowed for table '${table}'` }
    }
  }

  let monthIds: string[] | undefined
  if (month_range) {
    const { data: months } = await supabaseAdmin
      .from('months')
      .select('id')
      .gte('period', `${month_range.from}-01`)
      .lte('period', `${month_range.to}-01`)
    monthIds = months?.map(m => m.id) ?? []
  }

  // Build select with group-by cols + metric sums
  const selectCols = [...group_by, ...metrics].join(', ')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabaseAdmin.from(table).select(selectCols)

  if (monthIds) query = query.in('month_id', monthIds)

  if (filters) {
    for (const [col, val] of Object.entries(filters)) {
      if (!allowedCols.has(col)) continue
      if (Array.isArray(val)) {
        query = query.in(col, val)
      } else {
        query = query.eq(col, val)
      }
    }
  }

  if (order_by && (allowedCols.has(order_by) || allowedMetrics.has(order_by))) {
    query = query.order(order_by, { ascending: order_direction === 'asc' })
  }

  query = query.limit(limit)

  const { data, error } = await query
  if (error) return { error: error.message }

  return { table, rows: data ?? [], count: data?.length ?? 0 }
}

export async function execRunReadonlySql(
  input: z.infer<typeof RunReadonlySqlInputSchema>,
) {
  if (process.env.ENABLE_RAW_SQL_TOOL !== 'true') {
    return { error: 'Raw SQL tool is disabled' }
  }
  const { data, error } = await supabaseAdmin.rpc('kpi_readonly_query', {
    sql: input.sql,
  })
  if (error) return { error: error.message }
  return { rows: data }
}

export async function dispatchTool(name: string, input: unknown) {
  switch (name) {
    case 'list_months':
      return execListMonths()
    case 'get_kpi_values':
      return execGetKpiValues(GetKpiValuesInputSchema.parse(input))
    case 'compare_periods':
      return execComparePeriods(ComparePeriodsInputSchema.parse(input))
    case 'query_granular':
      return execQueryGranular(QueryGranularInputSchema.parse(input))
    case 'run_readonly_sql':
      return execRunReadonlySql(RunReadonlySqlInputSchema.parse(input))
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export const ANTHROPIC_TOOLS = [
  {
    name: 'list_months',
    description:
      'List all available months with their period, label, and quarter. Use this first to know what data is available.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_kpi_values',
    description:
      'Get KPI summary values for specified metrics and months. Returns values with metric metadata (unit, lower_is_better).',
    input_schema: {
      type: 'object' as const,
      properties: {
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Metric keys. Omit for all scorecard metrics.',
        },
        months: {
          type: 'array',
          items: { type: 'string' },
          description: 'YYYY-MM strings. Omit for last 6 months.',
        },
      },
    },
  },
  {
    name: 'compare_periods',
    description:
      'Compare a single metric between two months. Returns delta, % change, and whether it improved (lower_is_better aware).',
    input_schema: {
      type: 'object' as const,
      properties: {
        metric: { type: 'string', description: 'Metric key' },
        from: { type: 'string', description: 'YYYY-MM' },
        to: { type: 'string', description: 'YYYY-MM' },
        sku: {
          type: 'string',
          description: 'Optional SKU for per-SKU metrics',
        },
      },
      required: ['metric', 'from', 'to'],
    },
  },
  {
    name: 'query_granular',
    description:
      'Query granular report data (orders, ad performance, TikTok affiliates, inventory, etc.) with grouping and aggregation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          enum: [
            'orders',
            'shopify_sales',
            'ad_performance',
            'tiktok_affiliates',
            'tiktok_gmv_spend',
            'inventory_ledger',
            'delivery',
            'search_query',
          ],
        },
        month_range: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
          },
        },
        group_by: {
          type: 'array',
          items: { type: 'string' },
          description: 'Columns to group by (max 3)',
        },
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Numeric columns to aggregate (max 5)',
        },
        filters: {
          type: 'object',
          description: 'Key-value filters on group_by columns',
        },
        order_by: { type: 'string' },
        order_direction: { type: 'string', enum: ['asc', 'desc'] },
        limit: { type: 'number', default: 25 },
      },
      required: ['table', 'group_by', 'metrics'],
    },
  },
]
