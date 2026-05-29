import { getSectionData } from '@/lib/kpi-queries'
import { SectionTable } from '@/components/kpi/SectionTable'
import { SkuTable } from '@/components/kpi/SkuTable'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e']

export default async function OperationsPage() {
  const { months, values } = await getSectionData('ops', 12)

  const latestMonth = months[months.length - 1]
  const priorMonth = months[months.length - 2]

  const currentVals = latestMonth
    ? values.filter(v => v.month_id === latestMonth.id)
    : []
  const priorVals = priorMonth
    ? values.filter(v => v.month_id === priorMonth.id)
    : []

  const buildChartData = (metricKeys: string[]) =>
    months.map(m => {
      const row: Record<string, unknown> = { label: m.label.replace(' 20', ' \'') }
      metricKeys.forEach(k => {
        const v = values.find(v => v.month_id === m.id && v.metric_key === k)
        row[k] = v?.value ?? null
      })
      return row
    })

  const warehouseData = buildChartData(['ops_amz_warehouse_fee', 'ops_3pl_warehouse_fee'])
  const deliveryData = buildChartData(['ops_pct_over_2_days', 'ops_pct_over_5_days'])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Operations</h1>
        <p className="text-slate-500 text-sm mt-1">Warehouse fees, delivery performance, and inventory by SKU</p>
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No data available. Upload a KPI workbook to get started.
        </div>
      )}

      {months.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Warehouse Fees</h2>
            <TrendLineChart
              data={warehouseData}
              series={[
                { key: 'ops_amz_warehouse_fee', label: 'Amazon Fee', color: COLORS[0] },
                { key: 'ops_3pl_warehouse_fee', label: '3PL Fee',    color: COLORS[2] },
              ]}
              unit="currency"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Late Delivery % (lower is better)</h2>
            <TrendLineChart
              data={deliveryData}
              series={[
                { key: 'ops_pct_over_2_days', label: '> 2 Days %', color: COLORS[0] },
                { key: 'ops_pct_over_5_days', label: '> 5 Days %', color: COLORS[1] },
              ]}
              unit="percent"
            />
          </div>

          <SectionTable
            section="ops"
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
          />

          <SkuTable
            metricKey="ops_stockout_days"
            metricLabel="Amazon Stockout Days (# of Days < 60D)"
            unit="int"
            lowerIsBetter={true}
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            warnThreshold={0}
          />

          <SkuTable
            metricKey="ops_avg_inventory_days"
            metricLabel="Average Days of Inventory"
            unit="int"
            lowerIsBetter={false}
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            warnThreshold={30}
          />
        </>
      )}
    </div>
  )
}
