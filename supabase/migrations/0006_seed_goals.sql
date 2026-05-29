INSERT INTO kpi.goals (metric_key, quarter, target_value, comparator) VALUES
  ('tacos',           '2026-Q2', 0.17, 'lte'),
  ('total_refund_pct','2026-Q2', 0.06, 'lte')
ON CONFLICT (metric_key, quarter) DO NOTHING;
