-- Enable RLS on all tables
ALTER TABLE kpi.months           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.metric_catalog   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.kpi_values       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.goals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.upload_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.shopify_sales    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.ad_performance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.tiktok_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.tiktok_gmv_spend  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.inventory_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.delivery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi.search_query      ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read most tables
CREATE POLICY "authenticated_read_months"         ON kpi.months         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_metric_catalog" ON kpi.metric_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_kpi_values"     ON kpi.kpi_values     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_goals"          ON kpi.goals          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_upload_log"     ON kpi.upload_log     FOR SELECT TO authenticated USING (true);

-- Anonymous can read metric_catalog (for public APIs)
CREATE POLICY "anon_read_metric_catalog" ON kpi.metric_catalog FOR SELECT TO anon USING (true);

-- Conversations: scoped to owner
CREATE POLICY "authenticated_read_conversations"   ON kpi.conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "authenticated_manage_conversations" ON kpi.conversations FOR ALL    TO authenticated USING (user_id = auth.uid());

-- Granular tables: authenticated read
CREATE POLICY "authenticated_read_orders"             ON kpi.orders             FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_shopify_sales"      ON kpi.shopify_sales      FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_ad_performance"     ON kpi.ad_performance     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_tiktok_affiliates"  ON kpi.tiktok_affiliates  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_tiktok_gmv_spend"   ON kpi.tiktok_gmv_spend   FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_inventory_ledger"   ON kpi.inventory_ledger   FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_delivery"           ON kpi.delivery           FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_search_query"       ON kpi.search_query       FOR SELECT TO authenticated USING (true);

-- kpi_readonly role for AI raw-SQL tool
DO $$ BEGIN
  CREATE ROLE kpi_readonly NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
GRANT USAGE ON SCHEMA kpi TO kpi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA kpi TO kpi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA kpi GRANT SELECT ON TABLES TO kpi_readonly;
