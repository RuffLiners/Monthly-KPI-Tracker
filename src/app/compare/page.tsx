'use client'
import { useState, useEffect, useCallback } from 'react'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { METRICS } from '@/lib/metrics'
import { formatValue } from '@/lib/formatters'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface MonthRecord {
  id: string
  period: string
  label: string
}

interface KpiValueRow {
  month_id: string
  metric_key: string
  value: number | null
  period?: string
  label?: string
}

export default function ComparePage() {
  const [months, setMonths] = useState<MonthRecord[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['gross_revenue', 'tacos'])
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/months')
      .then(r => r.json())
      .then(d => setMonths(d.months ?? []))
  }, [])

  const fetchData = useCallback(async () => {
    if (!selectedMetrics.length) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        metrics: selectedMetrics.join(','),
      })
      const res = await fetch(`/api/kpi?${params}`, {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_KPI_API_KEY ?? ''}` },
      })
      if (!res.ok) {
        // fallback: use supabase directly via the months API response
        setLoading(false)
        return
      }
      const data = await res.json()
      const vals = (data.values ?? []) as KpiValueRow[]

      // Build chart data keyed by period
      const periodMap = new Map<string, Record<string, unknown>>()
      for (const v of vals) {
        const period = v.period?.slice(0, 7) ?? ''
        const label = v.label ?? period
        if (!periodMap.has(period)) {
          periodMap.set(period, { period, label })
        }
        const row = periodMap.get(period)!
        row[v.metric_key] = v.value
      }
      setChartData(
        Array.from(periodMap.values()).sort((a, b) =>
          String(a.period).localeCompare(String(b.period)),
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [selectedMetrics])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleMetric = (key: string) => {
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    )
  }

  const exportCsv = () => {
    if (!chartData.length) return
    const headers = ['period', ...selectedMetrics]
    const rows = chartData.map(row =>
      headers.map(h => String(row[h] ?? '')).join(','),
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kpi-trends.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Group metrics by section for the picker
  const sections = Array.from(new Set(METRICS.map(m => m.section)))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compare & Trends</h1>
          <p className="text-slate-500 text-sm mt-1">Overlay any metrics across months</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!chartData.length}
          className="text-sm px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-6">
        {/* Metric picker */}
        <div className="w-64 shrink-0 space-y-4">
          <p className="text-sm font-medium text-slate-700">Select metrics</p>
          {sections.map(section => (
            <div key={section}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {section}
              </p>
              <div className="space-y-0.5">
                {METRICS.filter(m => m.section === section && !m.isSkuMetric).map(m => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(m.key)}
                      onChange={() => toggleMetric(m.key)}
                      className="rounded"
                    />
                    <span className="text-xs text-slate-600 truncate">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              Loading…
            </div>
          )}

          {!loading && selectedMetrics.length === 0 && (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              Select at least one metric
            </div>
          )}

          {!loading && selectedMetrics.length > 0 && chartData.length === 0 && (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              No data yet. Upload a KPI workbook first.
            </div>
          )}

          {!loading && chartData.length > 0 && (
            <>
              {/* Group metrics by unit for separate charts */}
              {['currency', 'percent', 'int', 'duration'].map(unit => {
                const unitMetrics = selectedMetrics.filter(
                  k => METRICS.find(m => m.key === k)?.unit === unit,
                )
                if (!unitMetrics.length) return null
                return (
                  <div key={unit} className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4 capitalize">
                      {unit} metrics
                    </h2>
                    <TrendLineChart
                      data={chartData}
                      xDataKey="label"
                      unit={unit}
                      series={unitMetrics.map((k, i) => ({
                        key: k,
                        label: METRICS.find(m => m.key === k)?.label ?? k,
                        color: COLORS[i % COLORS.length],
                      }))}
                    />
                  </div>
                )
              })}

              {/* Data table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-2 px-4 text-left text-xs font-medium text-slate-500">Month</th>
                      {selectedMetrics.map(k => (
                        <th key={k} className="py-2 px-4 text-right text-xs font-medium text-slate-500">
                          {METRICS.find(m => m.key === k)?.label ?? k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-4 text-slate-700">{String(row.label)}</td>
                        {selectedMetrics.map(k => {
                          const def = METRICS.find(m => m.key === k)
                          return (
                            <td key={k} className="py-2 px-4 text-right text-slate-900">
                              {formatValue(row[k] as number | null, def?.unit ?? 'int')}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
