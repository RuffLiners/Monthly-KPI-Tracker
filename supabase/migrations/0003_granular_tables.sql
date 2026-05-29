-- orders: from "1. All Orders" tab
CREATE TABLE kpi.orders (
  id                  bigserial PRIMARY KEY,
  month_id            uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report       text DEFAULT '1. All Orders',
  amazon_order_id     text,
  purchase_date       date,
  order_status        text,
  fulfillment_channel text,
  sales_channel       text,
  sku                 text,
  asin                text,
  quantity            int,
  item_price          numeric,
  raw                 jsonb
);
CREATE INDEX orders_month ON kpi.orders(month_id);
CREATE INDEX orders_sku   ON kpi.orders(sku);

-- shopify_sales: from "2. Shopify Sales Report" tab
CREATE TABLE kpi.shopify_sales (
  id                bigserial PRIMARY KEY,
  month_id          uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report     text DEFAULT '2. Shopify Sales Report',
  sales_channel     text,
  sku               text,
  gross_sales       numeric,
  quantity_ordered  int,
  quantity_returned int,
  discounts         numeric,
  returns           numeric,
  net_sales         numeric,
  shipping_charges  numeric,
  taxes             numeric,
  total_sales       numeric,
  raw               jsonb
);
CREATE INDEX shopify_sales_month ON kpi.shopify_sales(month_id);
CREATE INDEX shopify_sales_sku   ON kpi.shopify_sales(sku);

-- ad_performance: unified SP/SD/SB/DSP/Google/Meta
CREATE TABLE kpi.ad_performance (
  id            bigserial PRIMARY KEY,
  month_id      uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report text,
  platform      text,
  ad_type       text,
  campaign      text,
  ad_group      text,
  sku           text,
  asin          text,
  impressions   bigint,
  clicks        int,
  ctr           numeric,
  cpc           numeric,
  spend         numeric,
  sales         numeric,
  units         int,
  raw           jsonb
);
CREATE INDEX ad_perf_month    ON kpi.ad_performance(month_id);
CREATE INDEX ad_perf_platform ON kpi.ad_performance(platform, ad_type);
CREATE INDEX ad_perf_sku      ON kpi.ad_performance(sku);

-- tiktok_affiliates: from "15. TikTok Affiliate Report"
CREATE TABLE kpi.tiktok_affiliates (
  id                bigserial PRIMARY KEY,
  month_id          uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report     text DEFAULT '15. TikTok Affiliate Report',
  creator_name      text,
  gmv               numeric,
  refunds           numeric,
  attributed_orders int,
  items_sold        int,
  aov               numeric,
  videos            int,
  live_streams      int,
  est_commission    numeric,
  samples_shipped   int,
  raw               jsonb
);
CREATE INDEX tiktok_aff_month   ON kpi.tiktok_affiliates(month_id);
CREATE INDEX tiktok_aff_creator ON kpi.tiktok_affiliates(creator_name);

-- tiktok_gmv_spend: from "16. TTS GMV Spend Report"
CREATE TABLE kpi.tiktok_gmv_spend (
  id             bigserial PRIMARY KEY,
  month_id       uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report  text DEFAULT '16. TTS GMV Spend Report',
  campaign       text,
  product_id     text,
  video_title    text,
  cost           numeric,
  sku_orders     int,
  cost_per_order numeric,
  gross_revenue  numeric,
  raw            jsonb
);
CREATE INDEX tiktok_gmv_month ON kpi.tiktok_gmv_spend(month_id);

-- inventory_ledger: from "17. Inventory Ledger"
CREATE TABLE kpi.inventory_ledger (
  id                 bigserial PRIMARY KEY,
  month_id           uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report      text DEFAULT '17. Inventory Ledger',
  ledger_date        date,
  fnsku              text,
  asin               text,
  msku               text,
  sku                text,
  disposition        text,
  starting_balance   int,
  receipts           int,
  customer_shipments int,
  customer_returns   int,
  stockout_days      int,
  days_of_supply     int,
  raw                jsonb
);
CREATE INDEX inv_ledger_month ON kpi.inventory_ledger(month_id);
CREATE INDEX inv_ledger_sku   ON kpi.inventory_ledger(sku);

-- delivery: from "18. Shopify Delivery Report"
CREATE TABLE kpi.delivery (
  id                 bigserial PRIMARY KEY,
  month_id           uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report      text DEFAULT '18. Shopify Delivery Report',
  shipping_region    text,
  fulfillment_hours  numeric,
  orders_delivered   int,
  orders_over_2_days int,
  orders_over_5_days int,
  raw                jsonb
);
CREATE INDEX delivery_month ON kpi.delivery(month_id);

-- search_query: from "6. SCP" and "7. SQP" tabs
CREATE TABLE kpi.search_query (
  id             bigserial PRIMARY KEY,
  month_id       uuid NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  source_report  text,
  platform       text,
  keyword        text,
  search_volume  int,
  impressions    bigint,
  clicks         int,
  purchases      int,
  raw            jsonb
);
CREATE INDEX search_query_month ON kpi.search_query(month_id);
