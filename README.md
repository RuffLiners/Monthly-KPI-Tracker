# Ruff Liners KPI Dashboard

A Next.js 14 App Router dashboard for tracking monthly KPIs across Amazon FBA (USA/CAN/MEX), Shopify, and TikTok Shop.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (server-only)
ANTHROPIC_API_KEY=              # Anthropic API key for AI Analyst
KPI_API_KEY=                    # Bearer token for external JSON API
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_RAW_SQL_TOOL=false       # Set true to enable raw SQL tool for AI (admin only)
```

### 2. Supabase Migrations

Run migrations in order against your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor:
# Run files in supabase/migrations/ in order: 0001 → 0006
```

Create a Storage bucket named `kpi-workbooks` (private).

### 3. Install & Run

```bash
npm install
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/overview` | Scorecard KPIs with MoM deltas, sparklines, goal badges |
| `/upload` | Drag-drop Excel workbook, parse preview, confirm & save |
| `/month/[id]` | Full metric list for any month, MoM vs prior |
| `/financial` | Revenue, margins, TACOS trend charts |
| `/channels` | Per-channel revenue mix + metrics |
| `/marketing` | Follower growth, branded search, affiliate videos |
| `/cx` | Response times, PQ metrics, NCX% |
| `/operations` | Warehouse fees, delivery %, per-SKU stockout/inventory |
| `/compare` | Multi-metric overlay chart + CSV export |
| `/ai` | Streaming AI Analyst with tool-use |

## Uploading Data

1. Go to `/upload`
2. Drop your monthly Excel file (e.g. `26_03_-_Monthly_KPI_Report.xlsx`)
3. The month is auto-detected from the filename (`YY_MM_` prefix)
4. Review the parse preview (matched metrics, granular row counts, warnings)
5. Confirm to save — re-uploading the same month creates a new version

## Adding a Metric

1. Add to `src/lib/metrics.ts` METRICS array with a unique `key`
2. Add the corresponding INSERT to `supabase/migrations/0005_seed_metric_catalog.sql` and run it
3. The parser will automatically match it by label (after normalizing whitespace)

## Setting / Editing Goals

Goals are stored in `kpi.goals`. Edit via:
- SQL: `INSERT INTO kpi.goals (metric_key, quarter, target_value, comparator) VALUES (...)`
- API: `POST /api/goals` with `{ metric_key, quarter, target_value, comparator }`

Current seeded goals:
- `tacos` target ≤ 17% in 2026-Q2
- `total_refund_pct` target ≤ 6% in 2026-Q2

## External JSON API

All endpoints require `Authorization: Bearer <KPI_API_KEY>`.

### `GET /api/kpi`
```
?metrics=gross_revenue,tacos     # comma-separated metric keys (optional, defaults to scorecard)
?months=2026-01,2026-02          # comma-separated YYYY-MM (optional, defaults to last 6)
```

### `GET /api/kpi/compare`
```
?metric=tacos&from=2026-01&to=2026-03&sku=RL-XL-V3.3B
```

### `POST /api/kpi/granular`
```json
{
  "table": "ad_performance",
  "month_range": { "from": "2026-01", "to": "2026-03" },
  "group_by": ["platform", "sku"],
  "metrics": ["spend", "sales"],
  "order_by": "spend",
  "limit": 50
}
```

## AI Tools Reference

The AI Analyst exposes these tools to Claude:

| Tool | Description |
|------|-------------|
| `list_months()` | Available periods with labels |
| `get_kpi_values({ metrics[], months[] })` | Summary KPI values with metadata |
| `compare_periods({ metric, from, to, sku? })` | Delta + % change between two months |
| `query_granular({ table, group_by[], metrics[], filters, month_range, limit })` | Aggregated granular data |
| `run_readonly_sql({ sql })` | Raw SQL (requires ENABLE_RAW_SQL_TOOL=true) |

## Phase 2 Path (Pipeline Convergence)

The `months.source` column already has `'upload' | 'pipeline'` semantics. To switch to pipeline-sourced data:

1. Write a new ingestion function that reads from your data pipeline Supabase tables
2. Insert months with `source = 'pipeline'` and upsert `kpi_values` with the same metric keys
3. The `latest_kpi_values` view and all queries are source-agnostic

## Phase 3 Path (Automation & Alerts)

- Scheduled refresh: GitHub Actions → call pipeline ingestion on a cron schedule
- Alerting: Query `goals` vs `latest_kpi_values` and send Slack/email if breached
- YoY: Add year-over-year comparisons once 12+ months are available

## MCP Server Path

The tool definitions in `src/lib/ai-tools.ts` (`ANTHROPIC_TOOLS`, `dispatchTool`) are already structured as MCP-compatible tool definitions. To expose as an MCP server, wrap `dispatchTool` with an MCP server adapter (e.g. `@modelcontextprotocol/sdk`) and re-export the same tool schemas.
