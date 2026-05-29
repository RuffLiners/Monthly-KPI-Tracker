import * as XLSX from 'xlsx'

export interface OrderRow {
  amazon_order_id?: string
  purchase_date?: string
  order_status?: string
  fulfillment_channel?: string
  sales_channel?: string
  sku?: string
  asin?: string
  quantity?: number
  item_price?: number
  raw: Record<string, unknown>
}

export interface ShopifySalesRow {
  sales_channel?: string
  sku?: string
  gross_sales?: number
  quantity_ordered?: number
  quantity_returned?: number
  discounts?: number
  returns?: number
  net_sales?: number
  shipping_charges?: number
  taxes?: number
  total_sales?: number
  raw: Record<string, unknown>
}

export interface AdPerformanceRow {
  platform: string
  ad_type: string
  source_report: string
  campaign?: string
  ad_group?: string
  sku?: string
  asin?: string
  impressions?: number
  clicks?: number
  ctr?: number
  cpc?: number
  spend?: number
  sales?: number
  units?: number
  raw: Record<string, unknown>
}

export interface TiktokAffiliateRow {
  creator_name?: string
  gmv?: number
  refunds?: number
  attributed_orders?: number
  items_sold?: number
  aov?: number
  videos?: number
  live_streams?: number
  est_commission?: number
  samples_shipped?: number
  raw: Record<string, unknown>
}

export interface TiktokGmvSpendRow {
  campaign?: string
  product_id?: string
  video_title?: string
  cost?: number
  sku_orders?: number
  cost_per_order?: number
  gross_revenue?: number
  raw: Record<string, unknown>
}

export interface InventoryLedgerRow {
  ledger_date?: string
  fnsku?: string
  asin?: string
  msku?: string
  sku?: string
  disposition?: string
  starting_balance?: number
  receipts?: number
  customer_shipments?: number
  customer_returns?: number
  stockout_days?: number
  days_of_supply?: number
  raw: Record<string, unknown>
}

export interface DeliveryRow {
  shipping_region?: string
  fulfillment_hours?: number
  orders_delivered?: number
  orders_over_2_days?: number
  orders_over_5_days?: number
  raw: Record<string, unknown>
}

export interface SearchQueryRow {
  platform: string
  source_report: string
  keyword?: string
  search_volume?: number
  impressions?: number
  clicks?: number
  purchases?: number
  raw: Record<string, unknown>
}

export interface GranularParseResult {
  orders: OrderRow[]
  shopifySales: ShopifySalesRow[]
  adPerformance: AdPerformanceRow[]
  tiktokAffiliates: TiktokAffiliateRow[]
  tiktokGmvSpend: TiktokGmvSpendRow[]
  inventoryLedger: InventoryLedgerRow[]
  delivery: DeliveryRow[]
  searchQuery: SearchQueryRow[]
  warnings: string[]
}

function findHeaderRow(allRows: unknown[][], expectedCols: string[], minMatches = 3): number {
  const normalized = expectedCols.map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const limit = Math.min(allRows.length, 15)
  for (let i = 0; i < limit; i++) {
    const rowNorm = (allRows[i] as unknown[]).map(v =>
      String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''),
    )
    const matches = normalized.filter(col => rowNorm.some(v => v.includes(col)))
    if (matches.length >= Math.min(minMatches, normalized.length)) return i
  }
  return 0
}

function getTabByPrefix(wb: XLSX.WorkBook, prefix: string): XLSX.WorkSheet | null {
  const sheetName = wb.SheetNames.find(n => n.startsWith(prefix))
  return sheetName ? wb.Sheets[sheetName] : null
}

function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: undefined,
    blankrows: false,
  }) as unknown[][]
}

function rowsToObjects(allRows: unknown[][], headerRowIdx: number): Record<string, unknown>[] {
  const headers = (allRows[headerRowIdx] as unknown[]).map(h =>
    String(h ?? '').trim().toLowerCase(),
  )
  return allRows
    .slice(headerRowIdx + 1)
    .map(row => {
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => {
        if (h) obj[h] = (row as unknown[])[i]
      })
      return obj
    })
    .filter(obj =>
      Object.values(obj).some(v => v !== undefined && v !== null && v !== ''),
    )
}

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n =
    typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,%\s]/g, ''))
  return isNaN(n) ? undefined : n
}

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  return s === '' ? undefined : s
}

function dateStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    if (d) {
      return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
    }
  }
  return str(v)
}

export function parseGranularTabs(buffer: Buffer): GranularParseResult {
  const wb = XLSX.read(buffer, {
    type: 'buffer',
    dense: true,
    cellFormula: false,
    cellText: false,
    cellNF: false,
    sheetStubs: false,
  })

  const result: GranularParseResult = {
    orders: [],
    shopifySales: [],
    adPerformance: [],
    tiktokAffiliates: [],
    tiktokGmvSpend: [],
    inventoryLedger: [],
    delivery: [],
    searchQuery: [],
    warnings: [],
  }

  // 1. All Orders
  const ordersSheet = getTabByPrefix(wb, '1. ')
  if (ordersSheet) {
    const allRows = sheetToRows(ordersSheet)
    const hIdx = findHeaderRow(allRows, ['amazon-order-id', 'purchase-date', 'sku'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.orders = objs.map(o => ({
      amazon_order_id: str(o['amazon-order-id']),
      purchase_date: dateStr(o['purchase-date']),
      order_status: str(o['order-status']),
      fulfillment_channel: str(o['fulfillment-channel']),
      sales_channel: str(o['sales-channel']),
      sku: str(o['sku']),
      asin: str(o['asin']),
      quantity: num(o['quantity']),
      item_price: num(o['item-price']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "1. All Orders" not found')
  }

  // 2. Shopify Sales Report
  const shopifySheet = getTabByPrefix(wb, '2. ')
  if (shopifySheet) {
    const allRows = sheetToRows(shopifySheet)
    const hIdx = findHeaderRow(allRows, ['product variant sku', 'gross sales', 'net sales'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.shopifySales = objs.map(o => ({
      sales_channel: str(o['sales channel']),
      sku: str(o['product variant sku']),
      gross_sales: num(o['gross sales']),
      quantity_ordered: num(o['quantity ordered']),
      quantity_returned: num(o['quantity returned']),
      discounts: num(o['discounts']),
      returns: num(o['returns']),
      net_sales: num(o['net sales']),
      shipping_charges: num(o['shipping charges']),
      taxes: num(o['taxes']),
      total_sales: num(o['total sales']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "2. Shopify Sales Report" not found')
  }

  // Ad tabs helper
  function parseAdTab(prefix: string, platform: string, adType: string) {
    const sheet = getTabByPrefix(wb, prefix)
    if (!sheet) {
      result.warnings.push(`Tab "${prefix}*" not found`)
      return
    }
    const allRows = sheetToRows(sheet)
    const hIdx = findHeaderRow(allRows, ['campaign name', 'impressions', 'clicks', 'spend'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    objs.forEach(o => {
      result.adPerformance.push({
        platform,
        ad_type: adType,
        source_report: prefix.trim(),
        campaign: str(o['campaign name']),
        ad_group: str(o['ad group name']) ?? str(o['ad group']),
        sku: str(o['advertised sku']) ?? str(o['sku']),
        asin: str(o['advertised asin']) ?? str(o['asin']),
        impressions: num(o['impressions']),
        clicks: num(o['clicks']),
        ctr:
          num(o['click-through rate (ctr)']) ??
          num(o['click-through rate']) ??
          num(o['ctr']),
        cpc:
          num(o['cost per click (cpc)']) ??
          num(o['cost per click']) ??
          num(o['cpc']),
        spend: num(o['spend']),
        sales:
          num(o['7 day total sales']) ??
          num(o['total sales']) ??
          num(o['combined product sales']),
        units:
          num(o['7 day total units (#)']) ??
          num(o['total units (#)']) ??
          num(o['combined units sold']),
        raw: o,
      })
    })
  }

  parseAdTab('8. ', 'amazon', 'sp')
  parseAdTab('9. ', 'amazon', 'sd')
  parseAdTab('10. ', 'amazon', 'sb')
  parseAdTab('12. ', 'amazon', 'dsp')

  // 15. TikTok Affiliate
  const tiktokAffSheet = getTabByPrefix(wb, '15. ')
  if (tiktokAffSheet) {
    const allRows = sheetToRows(tiktokAffSheet)
    const hIdx = findHeaderRow(allRows, ['creator name', 'gmv', 'attributed orders'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.tiktokAffiliates = objs.map(o => ({
      creator_name: str(o['creator name']),
      gmv: num(o['creator-attributed gmv']) ?? num(o['gmv']),
      refunds: num(o['refunds']),
      attributed_orders: num(o['attributed orders']),
      items_sold: num(o['items sold']),
      aov: num(o['aov']),
      videos: num(o['videos']),
      live_streams: num(o['live streams']),
      est_commission:
        num(o['est. commission']) ?? num(o['estimated commission']),
      samples_shipped: num(o['samples shipped']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "15. TikTok Affiliate Report" not found')
  }

  // 16. TTS GMV Spend
  const ttsGmvSheet = getTabByPrefix(wb, '16. ')
  if (ttsGmvSheet) {
    const allRows = sheetToRows(ttsGmvSheet)
    const hIdx = findHeaderRow(allRows, ['campaign', 'cost', 'gross revenue'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.tiktokGmvSpend = objs.map(o => ({
      campaign: str(o['campaign']),
      product_id: str(o['product id']) ?? str(o['product_id']),
      video_title: str(o['video title']) ?? str(o['video_title']),
      cost: num(o['cost']),
      sku_orders: num(o['sku orders']) ?? num(o['sku_orders']),
      cost_per_order:
        num(o['cost per order']) ?? num(o['cost_per_order']),
      gross_revenue:
        num(o['gross revenue']) ?? num(o['gross_revenue']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "16. TTS GMV Spend Report" not found')
  }

  // 17. Inventory Ledger
  const invSheet = getTabByPrefix(wb, '17. ')
  if (invSheet) {
    const allRows = sheetToRows(invSheet)
    const hIdx = findHeaderRow(allRows, ['date', 'fnsku', 'asin', 'starting balance'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.inventoryLedger = objs.map(o => ({
      ledger_date: dateStr(o['date']),
      fnsku: str(o['fnsku']),
      asin: str(o['asin']),
      msku: str(o['msku']),
      sku: str(o['msku']) ?? str(o['sku']),
      disposition: str(o['disposition']),
      starting_balance: num(o['starting balance']),
      receipts: num(o['receipts']),
      customer_shipments: num(o['customer shipments']),
      customer_returns: num(o['customer returns']),
      stockout_days:
        num(o['stock out days']) ?? num(o['stockout days']),
      days_of_supply: num(o['days of supply']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "17. Inventory Ledger" not found')
  }

  // 18. Shopify Delivery
  const deliverySheet = getTabByPrefix(wb, '18. ')
  if (deliverySheet) {
    const allRows = sheetToRows(deliverySheet)
    const hIdx = findHeaderRow(allRows, ['shipping region', 'orders delivered'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    result.delivery = objs.map(o => ({
      shipping_region: str(o['shipping region']),
      fulfillment_hours:
        num(o['fulfillment event (hours)']) ??
        num(o['fulfillment hours']),
      orders_delivered: num(o['orders delivered']),
      orders_over_2_days:
        num(o['orders > 2 days']) ??
        num(o['orders over 2 days']),
      orders_over_5_days:
        num(o['orders > 5 days']) ??
        num(o['orders over 5 days']),
      raw: o,
    }))
  } else {
    result.warnings.push('Tab "18. Shopify Delivery Report" not found')
  }

  // 6. SCP Search
  const scpSheet = getTabByPrefix(wb, '6. ')
  if (scpSheet) {
    const allRows = sheetToRows(scpSheet)
    const hIdx = findHeaderRow(allRows, ['keyword', 'impressions', 'clicks'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    objs.forEach(o => {
      result.searchQuery.push({
        platform: 'amazon',
        source_report: '6. SCP',
        keyword: str(o['search term']) ?? str(o['keyword']),
        search_volume:
          num(o['search volume']) ?? num(o['query volume']),
        impressions: num(o['impressions']),
        clicks: num(o['clicks']),
        purchases:
          num(o['purchases']) ??
          num(o['14 day total purchases (#)']),
        raw: o,
      })
    })
  }

  // 7. SQP Search
  const sqpSheet = getTabByPrefix(wb, '7. ')
  if (sqpSheet) {
    const allRows = sheetToRows(sqpSheet)
    const hIdx = findHeaderRow(allRows, ['search term', 'impressions', 'clicks'], 2)
    const objs = rowsToObjects(allRows, hIdx)
    objs.forEach(o => {
      result.searchQuery.push({
        platform: 'amazon',
        source_report: '7. SQP',
        keyword: str(o['search term']) ?? str(o['keyword']),
        search_volume:
          num(o['search frequency rank']) ??
          num(o['search volume']),
        impressions: num(o['impressions']),
        clicks: num(o['clicks']),
        purchases:
          num(o['purchases']) ??
          num(o['14 day total purchase (#)']),
        raw: o,
      })
    })
  }

  return result
}
