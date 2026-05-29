-- months: one row per calendar month
CREATE TABLE kpi.months (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period          date NOT NULL,
  label           text NOT NULL,
  quarter         text NOT NULL,
  source_filename text,
  source          text NOT NULL DEFAULT 'upload',
  uploaded_at     timestamptz DEFAULT now(),
  uploaded_by     uuid,
  UNIQUE(period)
);
CREATE INDEX months_period  ON kpi.months(period);
CREATE INDEX months_quarter ON kpi.months(quarter);

-- metric_catalog: static seed from lib/metrics.ts
CREATE TABLE kpi.metric_catalog (
  key             text PRIMARY KEY,
  label           text NOT NULL,
  section         text NOT NULL,
  channel         text,
  parent_key      text REFERENCES kpi.metric_catalog(key),
  unit            text NOT NULL,
  lower_is_better bool NOT NULL DEFAULT false,
  sort_order      int  NOT NULL DEFAULT 0,
  is_sku_metric   bool NOT NULL DEFAULT false
);

-- kpi_values: one row per (month, metric, sku, version)
CREATE TABLE kpi.kpi_values (
  id          bigserial PRIMARY KEY,
  month_id    uuid    NOT NULL REFERENCES kpi.months(id) ON DELETE CASCADE,
  metric_key  text    NOT NULL REFERENCES kpi.metric_catalog(key),
  sku         text,
  value       numeric,
  raw_text    text,
  version     int     NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at  timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX kpi_values_unique
  ON kpi.kpi_values(month_id, metric_key, COALESCE(sku, ''), version);
CREATE INDEX kpi_values_month_metric
  ON kpi.kpi_values(month_id, metric_key);

-- goals: quarterly targets (editable in-app)
CREATE TABLE kpi.goals (
  id           bigserial PRIMARY KEY,
  metric_key   text NOT NULL REFERENCES kpi.metric_catalog(key),
  quarter      text NOT NULL,
  target_value numeric NOT NULL,
  comparator   text NOT NULL CHECK (comparator IN ('lt','lte','gt','gte'))
);
CREATE UNIQUE INDEX goals_metric_quarter ON kpi.goals(metric_key, quarter);

-- latest_kpi_values: convenience view — max version per (month, metric, sku)
CREATE VIEW kpi.latest_kpi_values AS
SELECT DISTINCT ON (kv.month_id, kv.metric_key, kv.sku)
  kv.id,
  kv.month_id,
  kv.metric_key,
  kv.sku,
  kv.value,
  kv.raw_text,
  kv.version,
  kv.created_at,
  m.period,
  m.label,
  m.quarter
FROM kpi.kpi_values kv
JOIN kpi.months m ON m.id = kv.month_id
ORDER BY kv.month_id, kv.metric_key, kv.sku, kv.version DESC, kv.created_at DESC;

-- upload_log: audit of every workbook ingested
CREATE TABLE kpi.upload_log (
  id                     bigserial PRIMARY KEY,
  month_id               uuid REFERENCES kpi.months(id),
  filename               text,
  storage_path           text,
  matched_metrics        int,
  unmatched_labels       text[],
  parse_warnings         text[],
  granular_rows_inserted jsonb,
  uploaded_at            timestamptz DEFAULT now(),
  uploaded_by            uuid
);

-- conversations: saved AI chat sessions
CREATE TABLE kpi.conversations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid,
  title      text,
  messages   jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX conversations_user ON kpi.conversations(user_id);
