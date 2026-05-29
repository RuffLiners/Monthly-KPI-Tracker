export interface MetricDef {
  key: string
  label: string
  section: string
  channel?: string
  parentKey?: string
  unit: 'currency' | 'percent' | 'int' | 'duration' | 'text'
  lowerIsBetter: boolean
  sortOrder: number
  isSkuMetric: boolean
}

export const METRICS: MetricDef[] = [
  // SCORECARD
  { key: 'gross_revenue',       label: 'Gross Revenue',                       section: 'scorecard', unit: 'currency', lowerIsBetter: false, sortOrder: 10,   isSkuMetric: false },
  { key: 'total_ads_spend',     label: 'Total Ads Spend',                     section: 'scorecard', unit: 'currency', lowerIsBetter: false, sortOrder: 20,   isSkuMetric: false },
  { key: 'tacos',               label: 'TACOS (Total ADS / Total Revenue)',    section: 'scorecard', unit: 'percent',  lowerIsBetter: true,  sortOrder: 30,   isSkuMetric: false },
  { key: 'total_units_sold',    label: 'Total Units Sold',                     section: 'scorecard', unit: 'int',      lowerIsBetter: false, sortOrder: 40,   isSkuMetric: false },
  { key: 'total_refunds_units', label: 'Total Refunds (Units)',                section: 'scorecard', unit: 'int',      lowerIsBetter: true,  sortOrder: 50,   isSkuMetric: false },
  { key: 'total_refund_pct',    label: 'Total Refund (%)',                     section: 'scorecard', unit: 'percent',  lowerIsBetter: true,  sortOrder: 60,   isSkuMetric: false },

  // FINANCIAL
  { key: 'gross_margin',             label: 'Gross Margin',                    section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 100, isSkuMetric: false },
  { key: 'operational_overhead',     label: 'Operational Overhead (w/o Ads)', section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 110, isSkuMetric: false },
  { key: 'net_margin',               label: 'Net Margin',                      section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 120, isSkuMetric: false },
  { key: 'gross_margin_amazon_usa',  label: 'Gross Margin Amazon USA',         section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 130, isSkuMetric: false },
  { key: 'gross_margin_shopify',     label: 'Gross Margin Shopify',            section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 140, isSkuMetric: false },
  { key: 'gross_margin_tiktok',      label: 'Gross Margin TikTok Shop',        section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 150, isSkuMetric: false },
  { key: 'product_cost_pct',         label: 'Product Cost % (Amazon)',         section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 160, isSkuMetric: false },
  { key: 'amazon_promo_pct',         label: 'Amazon Promo % (Amazon)',         section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 170, isSkuMetric: false },
  { key: 'overhead_expenses',        label: 'Overhead Expenses',               section: 'financial', unit: 'currency', lowerIsBetter: false, sortOrder: 180, isSkuMetric: false },
  { key: 'overhead_expense_pct',     label: 'Overhead Expense %',              section: 'financial', unit: 'percent',  lowerIsBetter: false, sortOrder: 190, isSkuMetric: false },

  // CHANNELS - Amazon USA
  { key: 'amz_usa_revenue',         label: 'Gross Revenue',         section: 'channels', channel: 'amazon_usa', unit: 'currency', lowerIsBetter: false, sortOrder: 200, isSkuMetric: false },
  { key: 'amz_usa_ads_spend',       label: 'Ads Spend',             section: 'channels', channel: 'amazon_usa', unit: 'currency', lowerIsBetter: false, sortOrder: 210, isSkuMetric: false },
  { key: 'amz_usa_sp_spend',        label: '> SP Ads Spend',        section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 211, isSkuMetric: false },
  { key: 'amz_usa_sd_spend',        label: '> SD Ads Spend',        section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 212, isSkuMetric: false },
  { key: 'amz_usa_sb_spend',        label: '> SB Ads Spend',        section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 213, isSkuMetric: false },
  { key: 'amz_usa_dsp_spend',       label: '> DSP Ads Spend',       section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 214, isSkuMetric: false },
  { key: 'amz_usa_units',           label: 'Units Sold',            section: 'channels', channel: 'amazon_usa', unit: 'int',      lowerIsBetter: false, sortOrder: 220, isSkuMetric: false },
  { key: 'amz_usa_tacos',           label: 'TACOS — Calculated', section: 'channels', channel: 'amazon_usa', unit: 'percent',  lowerIsBetter: true,  sortOrder: 230, isSkuMetric: false },
  { key: 'amz_usa_refund_rate',     label: 'Refund Rate',           section: 'channels', channel: 'amazon_usa', unit: 'percent',  lowerIsBetter: true,  sortOrder: 240, isSkuMetric: false },
  { key: 'amz_usa_refunds',         label: 'Refunds (Units)',       section: 'channels', channel: 'amazon_usa', unit: 'int',      lowerIsBetter: true,  sortOrder: 250, isSkuMetric: false },
  { key: 'amz_usa_scp_impressions', label: 'SCP Impressions',       section: 'channels', channel: 'amazon_usa', unit: 'int',      lowerIsBetter: false, sortOrder: 260, isSkuMetric: false },
  { key: 'amz_usa_scp_bse',         label: '> SCP - Back Seat Extenders', section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_scp_impressions', unit: 'int', lowerIsBetter: false, sortOrder: 261, isSkuMetric: false },
  { key: 'amz_usa_scp_xlfc',        label: '> XL Floor Covers',    section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_scp_impressions', unit: 'int', lowerIsBetter: false, sortOrder: 262, isSkuMetric: false },
  { key: 'amz_usa_scp_bsh',         label: '> Back Seat Hammocks', section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_scp_impressions', unit: 'int', lowerIsBetter: false, sortOrder: 263, isSkuMetric: false },
  { key: 'amz_usa_scp_bsdb',        label: '> Back Seat Dog Beds', section: 'channels', channel: 'amazon_usa', parentKey: 'amz_usa_scp_impressions', unit: 'int', lowerIsBetter: false, sortOrder: 264, isSkuMetric: false },

  // CHANNELS - Amazon MEX
  { key: 'amz_mex_revenue', label: 'Revenue',      section: 'channels', channel: 'amazon_mex', unit: 'currency', lowerIsBetter: false, sortOrder: 300, isSkuMetric: false },
  { key: 'amz_mex_units',   label: 'Units Sold',   section: 'channels', channel: 'amazon_mex', unit: 'int',      lowerIsBetter: false, sortOrder: 310, isSkuMetric: false },
  { key: 'amz_mex_refunds', label: 'Refunds Units',section: 'channels', channel: 'amazon_mex', unit: 'int',      lowerIsBetter: true,  sortOrder: 320, isSkuMetric: false },

  // CHANNELS - Amazon CAN
  { key: 'amz_can_revenue',    label: 'Revenue',      section: 'channels', channel: 'amazon_can', unit: 'currency', lowerIsBetter: false, sortOrder: 350, isSkuMetric: false },
  { key: 'amz_can_ads_spend',  label: 'Ads Spend',    section: 'channels', channel: 'amazon_can', unit: 'currency', lowerIsBetter: false, sortOrder: 360, isSkuMetric: false },
  { key: 'amz_can_sp_spend',   label: '> SP Ads Spend', section: 'channels', channel: 'amazon_can', parentKey: 'amz_can_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 361, isSkuMetric: false },
  { key: 'amz_can_sb_spend',   label: '> SB Ads Spend', section: 'channels', channel: 'amazon_can', parentKey: 'amz_can_ads_spend', unit: 'currency', lowerIsBetter: false, sortOrder: 362, isSkuMetric: false },
  { key: 'amz_can_tacos',      label: 'TACOS',        section: 'channels', channel: 'amazon_can', unit: 'percent',  lowerIsBetter: true,  sortOrder: 370, isSkuMetric: false },
  { key: 'amz_can_units',      label: 'Units Sold',   section: 'channels', channel: 'amazon_can', unit: 'int',      lowerIsBetter: false, sortOrder: 380, isSkuMetric: false },
  { key: 'amz_can_refunds',    label: 'Refunds',      section: 'channels', channel: 'amazon_can', unit: 'int',      lowerIsBetter: true,  sortOrder: 390, isSkuMetric: false },
  { key: 'amz_can_refund_pct', label: 'Refund %',     section: 'channels', channel: 'amazon_can', unit: 'percent',  lowerIsBetter: true,  sortOrder: 400, isSkuMetric: false },

  // CHANNELS - Shopify
  { key: 'shopify_revenue',     label: 'Gross Revenue',     section: 'channels', channel: 'shopify', unit: 'currency', lowerIsBetter: false, sortOrder: 450, isSkuMetric: false },
  { key: 'shopify_units',       label: 'Quantity Sold',     section: 'channels', channel: 'shopify', unit: 'int',      lowerIsBetter: false, sortOrder: 460, isSkuMetric: false },
  { key: 'shopify_returns',     label: 'Quantity Returned', section: 'channels', channel: 'shopify', unit: 'int',      lowerIsBetter: true,  sortOrder: 470, isSkuMetric: false },
  { key: 'shopify_refund_rate', label: 'Refund Rate',       section: 'channels', channel: 'shopify', unit: 'percent',  lowerIsBetter: true,  sortOrder: 480, isSkuMetric: false },
  { key: 'shopify_tacos',       label: 'TACOS',             section: 'channels', channel: 'shopify', unit: 'percent',  lowerIsBetter: true,  sortOrder: 490, isSkuMetric: false },

  // Cross-channel ads
  { key: 'google_ads',    label: 'Google Ads', section: 'channels', unit: 'currency', lowerIsBetter: false, sortOrder: 520, isSkuMetric: false },
  { key: 'tiktok_ads',    label: 'TikTok Ads', section: 'channels', unit: 'currency', lowerIsBetter: false, sortOrder: 530, isSkuMetric: false },
  { key: 'meta_ads',      label: 'Meta Ada',   section: 'channels', unit: 'currency', lowerIsBetter: false, sortOrder: 540, isSkuMetric: false },
  { key: 'microsoft_ads', label: 'Microsoft',  section: 'channels', unit: 'currency', lowerIsBetter: false, sortOrder: 550, isSkuMetric: false },

  // CHANNELS - TikTok Shop
  { key: 'tts_revenue',        label: 'TikTok Grross Revenue', section: 'channels', channel: 'tiktok_shop', unit: 'currency', lowerIsBetter: false, sortOrder: 580, isSkuMetric: false },
  { key: 'tts_units',          label: 'Quantity Sold',         section: 'channels', channel: 'tiktok_shop', unit: 'int',      lowerIsBetter: false, sortOrder: 590, isSkuMetric: false },
  { key: 'tts_returns',        label: 'Returns',               section: 'channels', channel: 'tiktok_shop', unit: 'int',      lowerIsBetter: true,  sortOrder: 600, isSkuMetric: false },
  { key: 'tts_return_rate',    label: 'Return Rate',           section: 'channels', channel: 'tiktok_shop', unit: 'percent',  lowerIsBetter: true,  sortOrder: 610, isSkuMetric: false },
  { key: 'tts_gmv_ads',        label: 'GMV Max Ads',           section: 'channels', channel: 'tiktok_shop', unit: 'currency', lowerIsBetter: false, sortOrder: 620, isSkuMetric: false },
  { key: 'tts_affiliate_comm', label: 'Affiliate Commissions', section: 'channels', channel: 'tiktok_shop', unit: 'currency', lowerIsBetter: false, sortOrder: 630, isSkuMetric: false },
  { key: 'tts_tacos',          label: 'TACOS',                 section: 'channels', channel: 'tiktok_shop', unit: 'percent',  lowerIsBetter: true,  sortOrder: 640, isSkuMetric: false },

  // CHANNELS - Walmart
  { key: 'walmart_revenue', label: 'Revenue',    section: 'channels', channel: 'walmart', unit: 'currency', lowerIsBetter: false, sortOrder: 680, isSkuMetric: false },
  { key: 'walmart_units',   label: 'Units Sold', section: 'channels', channel: 'walmart', unit: 'int',      lowerIsBetter: false, sortOrder: 690, isSkuMetric: false },
  { key: 'walmart_refunds', label: 'Refunds',    section: 'channels', channel: 'walmart', unit: 'int',      lowerIsBetter: true,  sortOrder: 700, isSkuMetric: false },

  // CX
  { key: 'cx_disposal_pct',          label: 'Customer Returns - Disposal %',     section: 'cx', unit: 'percent',  lowerIsBetter: false, sortOrder: 800, isSkuMetric: false },
  { key: 'cx_response_time',         label: 'Average Response Time',             section: 'cx', unit: 'duration', lowerIsBetter: true,  sortOrder: 810, isSkuMetric: false },
  { key: 'cx_resolution_time',       label: 'Average Resolution Time',           section: 'cx', unit: 'duration', lowerIsBetter: true,  sortOrder: 820, isSkuMetric: false },
  { key: 'cx_pq_refund_units',       label: 'PQ Refund (>30 D) (Units Refunded)', section: 'cx', unit: 'int',     lowerIsBetter: true,  sortOrder: 830, isSkuMetric: false },
  { key: 'cx_pq_replacement_units',  label: 'PQ Replacement (Units Replaced)',   section: 'cx', unit: 'int',      lowerIsBetter: false, sortOrder: 840, isSkuMetric: false },
  { key: 'cx_ncx_pct',               label: 'PQ Negative Review % (NCX)',        section: 'cx', unit: 'percent',  lowerIsBetter: true,  sortOrder: 850, isSkuMetric: false },

  // MARKETING
  { key: 'mkt_email_list',                label: 'Klayvio',                                section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 900, isSkuMetric: false },
  { key: 'mkt_tiktok_followers',          label: 'Followers on TikTok',                    section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 910, isSkuMetric: false },
  { key: 'mkt_instagram_followers',       label: 'Followers on Instagram',                 section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 920, isSkuMetric: false },
  { key: 'mkt_facebook_followers',        label: 'Followers on Facebook',                  section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 930, isSkuMetric: false },
  { key: 'mkt_amazon_branded_search',     label: 'Branded Search Terms - Amazon',          section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 940, isSkuMetric: false },
  { key: 'mkt_google_branded_clicks',     label: 'Branded Search Terms - Google (Clicks)', section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 950, isSkuMetric: false },
  { key: 'mkt_google_branded_impressions',label: '(Impressions)',                           section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 960, isSkuMetric: false },
  { key: 'mkt_affiliate_videos',          label: 'Affiliate Videos Posted on TikTok',      section: 'marketing', unit: 'int', lowerIsBetter: false, sortOrder: 970, isSkuMetric: false },

  // OPERATIONS
  { key: 'ops_amz_warehouse_fee',   label: 'Warehouse & Storage Fee (Amazon USA)',              section: 'ops', unit: 'currency', lowerIsBetter: false, sortOrder: 1000, isSkuMetric: false },
  { key: 'ops_amz_warehouse_pct',   label: 'Warehouse & Storage Fee % (Amazon)',               section: 'ops', unit: 'percent',  lowerIsBetter: false, sortOrder: 1010, isSkuMetric: false },
  { key: 'ops_3pl_warehouse_fee',   label: 'Warehouse & Storage Fee (3PL)',                    section: 'ops', unit: 'currency', lowerIsBetter: false, sortOrder: 1020, isSkuMetric: false },
  { key: 'ops_3pl_warehouse_pct',   label: 'Warehouse & Storage Fee % (Shopify+TTS)',          section: 'ops', unit: 'percent',  lowerIsBetter: false, sortOrder: 1030, isSkuMetric: false },
  { key: 'ops_avg_delivery_time',   label: 'Average Delivery Time — Shopify & TikTok (Hours)', section: 'ops', unit: 'duration', lowerIsBetter: true,  sortOrder: 1040, isSkuMetric: false },
  { key: 'ops_pct_over_2_days',     label: '% of Orders Delivered >2 Days',                   section: 'ops', unit: 'percent',  lowerIsBetter: true,  sortOrder: 1050, isSkuMetric: false },
  { key: 'ops_pct_over_5_days',     label: '% of Orders Delivered >5 Days',                   section: 'ops', unit: 'percent',  lowerIsBetter: true,  sortOrder: 1060, isSkuMetric: false },
  { key: 'ops_stockout_days',       label: 'Amazon Stockout Days (# of Days < 60D)',           section: 'ops', unit: 'int',      lowerIsBetter: true,  sortOrder: 1070, isSkuMetric: true  },
  { key: 'ops_avg_inventory_days',  label: 'Average days of inventory',                        section: 'ops', unit: 'int',      lowerIsBetter: false, sortOrder: 1080, isSkuMetric: true  },
]

export const SKU_LIST = [
  'RL-XL-V3.3B',
  'RL-XL-V3.3G',
  'RL-MX-V3.3B',
  'RL-MX-V3.3G',
  'RL-LX-V3.3B',
  'RL-LX-V3.3G',
  'RL-M-V3.3B',
  'RL-L-V3.3B',
  'RL-XL-V4PALS',
  'RL-MDB-V1',
  'RL-MDB-V1G',
  'RL-XLDB-V1',
  'RL-XLDB-V1G',
  'RL-WI-V3',
  'RL-2BWL-V1.0',
]

export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Build lookup map: normalized label -> array of MetricDef (multiple channels can share same label)
export const METRIC_BY_LABEL: Map<string, MetricDef[]> = new Map()
for (const m of METRICS) {
  const key = normalizeLabel(m.label)
  const existing = METRIC_BY_LABEL.get(key)
  if (existing) {
    existing.push(m)
  } else {
    METRIC_BY_LABEL.set(key, [m])
  }
}

export const METRIC_BY_KEY: Map<string, MetricDef> = new Map(METRICS.map(m => [m.key, m]))

export const SECTION_LABELS: Record<string, string> = {
  scorecard: 'Scorecard',
  financial: 'Financial',
  channels:  'Sales Channels',
  cx:        'Customer Experience',
  marketing: 'Marketing',
  ops:       'Operations',
}

export const CHANNEL_LABELS: Record<string, string> = {
  amazon_usa:  'Amazon USA',
  amazon_mex:  'Amazon MEX',
  amazon_can:  'Amazon CAN',
  shopify:     'Shopify',
  tiktok_shop: 'TikTok Shop',
  walmart:     'Walmart',
}
