INSERT INTO kpi.metric_catalog (key, label, section, channel, parent_key, unit, lower_is_better, sort_order, is_sku_metric) VALUES

-- SCORECARD
('gross_revenue',       'Gross Revenue',                        'scorecard', NULL, NULL,                'currency', false, 10, false),
('total_ads_spend',     'Total Ads Spend',                      'scorecard', NULL, NULL,                'currency', false, 20, false),
('tacos',               'TACOS (Total ADS / Total Revenue)',     'scorecard', NULL, NULL,                'percent',  true,  30, false),
('total_units_sold',    'Total Units Sold',                      'scorecard', NULL, NULL,                'int',      false, 40, false),
('total_refunds_units', 'Total Refunds (Units)',                  'scorecard', NULL, NULL,                'int',      true,  50, false),
('total_refund_pct',    'Total Refund (%)',                       'scorecard', NULL, NULL,                'percent',  true,  60, false),

-- FINANCIAL
('gross_margin',              'Gross Margin',                       'financial', NULL, NULL, 'percent',  false, 100, false),
('operational_overhead',      'Operational Overhead (w/o Ads)',     'financial', NULL, NULL, 'percent',  false, 110, false),
('net_margin',                'Net Margin',                         'financial', NULL, NULL, 'percent',  false, 120, false),
('gross_margin_amazon_usa',   'Gross Margin Amazon USA',            'financial', NULL, NULL, 'percent',  false, 130, false),
('gross_margin_shopify',      'Gross Margin Shopify',               'financial', NULL, NULL, 'percent',  false, 140, false),
('gross_margin_tiktok',       'Gross Margin TikTok Shop',           'financial', NULL, NULL, 'percent',  false, 150, false),
('product_cost_pct',          'Product Cost % (Amazon)',            'financial', NULL, NULL, 'percent',  false, 160, false),
('amazon_promo_pct',          'Amazon Promo % (Amazon)',            'financial', NULL, NULL, 'percent',  false, 170, false),
('overhead_expenses',         'Overhead Expenses',                  'financial', NULL, NULL, 'currency', false, 180, false),
('overhead_expense_pct',      'Overhead Expense %',                 'financial', NULL, NULL, 'percent',  false, 190, false),

-- CHANNELS - Amazon USA
('amz_usa_revenue',           'Gross Revenue',                      'channels', 'amazon_usa', NULL,                    'currency', false, 200, false),
('amz_usa_ads_spend',         'Ads Spend',                          'channels', 'amazon_usa', NULL,                    'currency', false, 210, false),
('amz_usa_sp_spend',          '> SP Ads Spend',                     'channels', 'amazon_usa', 'amz_usa_ads_spend',     'currency', false, 211, false),
('amz_usa_sd_spend',          '> SD Ads Spend',                     'channels', 'amazon_usa', 'amz_usa_ads_spend',     'currency', false, 212, false),
('amz_usa_sb_spend',          '> SB Ads Spend',                     'channels', 'amazon_usa', 'amz_usa_ads_spend',     'currency', false, 213, false),
('amz_usa_dsp_spend',         '> DSP Ads Spend',                    'channels', 'amazon_usa', 'amz_usa_ads_spend',     'currency', false, 214, false),
('amz_usa_units',             'Units Sold',                         'channels', 'amazon_usa', NULL,                    'int',      false, 220, false),
('amz_usa_tacos',             'TACOS — Calculated',                 'channels', 'amazon_usa', NULL,                    'percent',  true,  230, false),
('amz_usa_refund_rate',       'Refund Rate',                        'channels', 'amazon_usa', NULL,                    'percent',  true,  240, false),
('amz_usa_refunds',           'Refunds (Units)',                     'channels', 'amazon_usa', NULL,                    'int',      true,  250, false),
('amz_usa_scp_impressions',   'SCP Impressions',                    'channels', 'amazon_usa', NULL,                    'int',      false, 260, false),
('amz_usa_scp_bse',           '> SCP - Back Seat Extenders',        'channels', 'amazon_usa', 'amz_usa_scp_impressions','int',     false, 261, false),
('amz_usa_scp_xlfc',          '> XL Floor Covers',                  'channels', 'amazon_usa', 'amz_usa_scp_impressions','int',     false, 262, false),
('amz_usa_scp_bsh',           '> Back Seat Hammocks',               'channels', 'amazon_usa', 'amz_usa_scp_impressions','int',     false, 263, false),
('amz_usa_scp_bsdb',          '> Back Seat Dog Beds',               'channels', 'amazon_usa', 'amz_usa_scp_impressions','int',     false, 264, false),

-- CHANNELS - Amazon MEX
('amz_mex_revenue',           'Revenue',                            'channels', 'amazon_mex', NULL, 'currency', false, 300, false),
('amz_mex_units',             'Units Sold',                         'channels', 'amazon_mex', NULL, 'int',      false, 310, false),
('amz_mex_refunds',           'Refunds Units',                      'channels', 'amazon_mex', NULL, 'int',      true,  320, false),

-- CHANNELS - Amazon CAN
('amz_can_revenue',           'Revenue',                            'channels', 'amazon_can', NULL,                    'currency', false, 350, false),
('amz_can_ads_spend',         'Ads Spend',                          'channels', 'amazon_can', NULL,                    'currency', false, 360, false),
('amz_can_sp_spend',          '> SP Ads Spend',                     'channels', 'amazon_can', 'amz_can_ads_spend',     'currency', false, 361, false),
('amz_can_sb_spend',          '> SB Ads Spend',                     'channels', 'amazon_can', 'amz_can_ads_spend',     'currency', false, 362, false),
('amz_can_tacos',             'TACOS',                              'channels', 'amazon_can', NULL,                    'percent',  true,  370, false),
('amz_can_units',             'Units Sold',                         'channels', 'amazon_can', NULL,                    'int',      false, 380, false),
('amz_can_refunds',           'Refunds',                            'channels', 'amazon_can', NULL,                    'int',      true,  390, false),
('amz_can_refund_pct',        'Refund %',                           'channels', 'amazon_can', NULL,                    'percent',  true,  400, false),

-- CHANNELS - Shopify
('shopify_revenue',           'Gross Revenue',                      'channels', 'shopify', NULL, 'currency', false, 450, false),
('shopify_units',             'Quantity Sold',                      'channels', 'shopify', NULL, 'int',      false, 460, false),
('shopify_returns',           'Quantity Returned',                  'channels', 'shopify', NULL, 'int',      true,  470, false),
('shopify_refund_rate',       'Refund Rate',                        'channels', 'shopify', NULL, 'percent',  true,  480, false),
('shopify_tacos',             'TACOS',                              'channels', 'shopify', NULL, 'percent',  true,  490, false),

-- Cross-channel ads
('google_ads',                'Google Ads',                         'channels', NULL, NULL, 'currency', false, 520, false),
('tiktok_ads',                'TikTok Ads',                         'channels', NULL, NULL, 'currency', false, 530, false),
('meta_ads',                  'Meta Ada',                           'channels', NULL, NULL, 'currency', false, 540, false),
('microsoft_ads',             'Microsoft',                          'channels', NULL, NULL, 'currency', false, 550, false),

-- CHANNELS - TikTok Shop
('tts_revenue',               'TikTok Grross Revenue',              'channels', 'tiktok_shop', NULL, 'currency', false, 580, false),
('tts_units',                 'Quantity Sold',                      'channels', 'tiktok_shop', NULL, 'int',      false, 590, false),
('tts_returns',               'Returns',                            'channels', 'tiktok_shop', NULL, 'int',      true,  600, false),
('tts_return_rate',           'Return Rate',                        'channels', 'tiktok_shop', NULL, 'percent',  true,  610, false),
('tts_gmv_ads',               'GMV Max Ads',                        'channels', 'tiktok_shop', NULL, 'currency', false, 620, false),
('tts_affiliate_comm',        'Affiliate Commissions',              'channels', 'tiktok_shop', NULL, 'currency', false, 630, false),
('tts_tacos',                 'TACOS',                              'channels', 'tiktok_shop', NULL, 'percent',  true,  640, false),

-- CHANNELS - Walmart
('walmart_revenue',           'Revenue',                            'channels', 'walmart', NULL, 'currency', false, 680, false),
('walmart_units',             'Units Sold',                         'channels', 'walmart', NULL, 'int',      false, 690, false),
('walmart_refunds',           'Refunds',                            'channels', 'walmart', NULL, 'int',      true,  700, false),

-- CX
('cx_disposal_pct',           'Customer Returns - Disposal %',              'cx', NULL, NULL, 'percent',  false, 800, false),
('cx_response_time',          'Average Response Time',                      'cx', NULL, NULL, 'duration', true,  810, false),
('cx_resolution_time',        'Average Resolution Time',                    'cx', NULL, NULL, 'duration', true,  820, false),
('cx_pq_refund_units',        'PQ Refund (>30 D) (Units Refunded)',         'cx', NULL, NULL, 'int',      true,  830, false),
('cx_pq_replacement_units',   'PQ Replacement (Units Replaced)',            'cx', NULL, NULL, 'int',      false, 840, false),
('cx_ncx_pct',                'PQ Negative Review % (NCX)',                 'cx', NULL, NULL, 'percent',  true,  850, false),

-- MARKETING
('mkt_email_list',               'Klayvio',                                  'marketing', NULL, NULL, 'int', false, 900, false),
('mkt_tiktok_followers',         'Followers on TikTok',                      'marketing', NULL, NULL, 'int', false, 910, false),
('mkt_instagram_followers',      'Followers on Instagram',                   'marketing', NULL, NULL, 'int', false, 920, false),
('mkt_facebook_followers',       'Followers on Facebook',                    'marketing', NULL, NULL, 'int', false, 930, false),
('mkt_amazon_branded_search',    'Branded Search Terms - Amazon',            'marketing', NULL, NULL, 'int', false, 940, false),
('mkt_google_branded_clicks',    'Branded Search Terms - Google (Clicks)',   'marketing', NULL, NULL, 'int', false, 950, false),
('mkt_google_branded_impressions','(Impressions)',                            'marketing', NULL, NULL, 'int', false, 960, false),
('mkt_affiliate_videos',         'Affiliate Videos Posted on TikTok',       'marketing', NULL, NULL, 'int', false, 970, false),

-- OPERATIONS
('ops_amz_warehouse_fee',     'Warehouse & Storage Fee (Amazon USA)',                  'ops', NULL, NULL, 'currency', false, 1000, false),
('ops_amz_warehouse_pct',     'Warehouse & Storage Fee % (Amazon)',                   'ops', NULL, NULL, 'percent',  false, 1010, false),
('ops_3pl_warehouse_fee',     'Warehouse & Storage Fee (3PL)',                        'ops', NULL, NULL, 'currency', false, 1020, false),
('ops_3pl_warehouse_pct',     'Warehouse & Storage Fee % (Shopify+TTS)',              'ops', NULL, NULL, 'percent',  false, 1030, false),
('ops_avg_delivery_time',     'Average Delivery Time — Shopify & TikTok (Hours)',     'ops', NULL, NULL, 'duration', true,  1040, false),
('ops_pct_over_2_days',       '% of Orders Delivered >2 Days',                       'ops', NULL, NULL, 'percent',  true,  1050, false),
('ops_pct_over_5_days',       '% of Orders Delivered >5 Days',                       'ops', NULL, NULL, 'percent',  true,  1060, false),
('ops_stockout_days',         'Amazon Stockout Days (# of Days < 60D)',               'ops', NULL, NULL, 'int',      true,  1070, true),
('ops_avg_inventory_days',    'Average days of inventory',                            'ops', NULL, NULL, 'int',      false, 1080, true)

ON CONFLICT (key) DO UPDATE SET
  label           = EXCLUDED.label,
  section         = EXCLUDED.section,
  channel         = EXCLUDED.channel,
  parent_key      = EXCLUDED.parent_key,
  unit            = EXCLUDED.unit,
  lower_is_better = EXCLUDED.lower_is_better,
  sort_order      = EXCLUDED.sort_order,
  is_sku_metric   = EXCLUDED.is_sku_metric;
