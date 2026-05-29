import { getScorecardData, getGoalsForQuarter } from '@/lib/kpi-queries'
import { METRICS } from '@/lib/metrics'
import { KpiCard } from '@/components/kpi/KpiCard'
import { formatValue } from '@/lib/formatters'
import Link from 'next/link'

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export default async function OverviewPage() {
  const { months, values } = await getScorecardData(6)
  const quarter = getCurrentQuarter()
  const goals = await getGoalsForQuarter(quarter)

  const scorecardMetrics = METRICS.filter(m => m.section === 'scorecard').sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )

  // Build a map: metricKey -> array of values by month (sorted oldest->newest)
  const valueMap: Record<string, (number | null)[]> = {}
  for (const m of scorecardMetrics) {
    valueMap[m.key] = months.map(month => {
      const v = values.find(
        v => v.month_id === month.id && v.metric_key === m.key,
      )
      return v ? (v.value as number | null) : null
    })
  }

  const latestMonth = months[months.length - 1]
  const priorMonth = months[months.length - 2]

  const getLatest = (key: string) =>
    latestMonth
      ? (values.find(v => v.month_id === latestMonth.id && v.metric_key === key)
          ?.value as number | null | undefined)
      : null

  const getPrior = (key: string) =>
    priorMonth
      ? (values.find(v => v.month_id === priorMonth.id && v.metric_key === key)
          ?.value as number | null | undefined)
      : null

  // Goal check helper
  const checkGoal = (metricKey: string, value: number | null | undefined) => {
    if (value == null) return null
    const goal = goals.find(g => g.metric_key === metricKey)
    if (!goal) return null
    const tv = goal.target_value as number
    const comp = goal.comparator as string
    const met =
      comp === 'lt'  ? value < tv  :
      comp === 'lte' ? value <= tv :
      comp === 'gt'  ? value > tv  :
      comp === 'gte' ? value >= tv : null
    return met
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
        {latestMonth && (
          <p className="text-slate-500 text-sm mt-1">
            Latest month: <span className="font-medium">{latestMonth.label}</span>
            {' · '}Quarter: <span className="font-medium">{latestMonth.quarter}</span>
          </p>
        )}
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          <p className="text-lg font-medium mb-2">No data yet</p>
          <p className="text-sm">
            <Link href="/upload" className="text-primary underline">Upload your first KPI workbook</Link> to get started.
          </p>
        </div>
      )}

      {/* Scorecard grid */}
      {months.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scorecardMetrics.map(m => {
            const latest = getLatest(m.key)
            const prior = getPrior(m.key)
            const spark = valueMap[m.key]
              .filter((v): v is number => v !== null)
              .map(v => ({ value: v }))
            const goalMet = checkGoal(m.key, latest)
            const goal = goals.find(g => g.metric_key === m.key)
            const goalLabel = goal
              ? `Target ${goal.comparator} ${formatValue(goal.target_value as number, m.unit)}`
              : undefined

            return (
              <KpiCard
                key={m.key}
                label={m.label}
                value={latest}
                priorValue={prior}
                sparklineData={spark}
                unit={m.unit}
                lowerIsBetter={m.lowerIsBetter}
                goalMet={goalMet}
                goalLabel={goalLabel}
              />
            )
          })}
        </div>
      )}

      {/* Month table */}
      {months.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase">Metric</th>
                {months.map(m => (
                  <th key={m.id} className="py-2 px-4 text-right text-xs font-medium text-slate-500 uppercase">
                    <Link href={`/month/${m.id}`} className="hover:text-primary">
                      {m.label}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scorecardMetrics.map(m => (
                <tr key={m.key} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-4 text-slate-700 font-medium">{m.label}</td>
                  {months.map(month => {
                    const v = values.find(
                      v => v.month_id === month.id && v.metric_key === m.key,
                    )
                    return (
                      <td key={month.id} className="py-2 px-4 text-right text-slate-900">
                        {formatValue(v?.value as number | null | undefined, m.unit)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
