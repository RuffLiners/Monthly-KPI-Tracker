import { getSectionData } from '@/lib/kpi-queries'
import { METRICS, CHANNEL_LABELS } from '@/lib/metrics'
import { SectionTable } from '@/components/kpi/SectionTable'
import { StackedBarChart } from '@/components/charts/StackedBarChart'
import { formatValue, formatMoMDelta } from '@/lib/formatters'

const CHANNEL_COLORS: Record<string, string> = {
  amazon_usa:  '#f59e0b',
  amazon_mex:  '#fcd34d',
  amazon_can:  '#fde68a',
  shopify:     '#3b82f6',
  tiktok_shop: '#8b5cf6',
  walmart:     '#22c55e',
}

const CHANNEL_REVENUE_KEYS: Record<string, string> = {
  amazon_usa:  'amz_usa_revenue',
  amazon_mex:  'amz_mex_revenue',
  amazon_can:  'amz_can_revenue',
  shopify:     'shopify_revenue',
  tiktok_shop: 'tts_revenue',
  walmart:     'walmart_revenue',
}

export default async function ChannelsPage() {
  const { months, values } = await getSectionData('channels', 12)

  const latestMonth = months[months.length - 1]
  const priorMonth = months[months.length - 2]

  const currentVals = latestMonth
    ? values.filter(v => v.month_id === latestMonth.id)
    : []
  const priorVals = priorMonth
    ? values.filter(v => v.month_id === priorMonth.id)
    : []

  // Revenue mix chart
  const channels = Object.keys(CHANNEL_REVENUE_KEYS)
  const revMixData = months.map(m => {
    const row: Record<string, unknown> = { label: m.label.replace(' 20', ' \'') }
    channels.forEach(ch => {
      const key = CHANNEL_REVENUE_KEYS[ch]
      const v = values.find(
        v => v.month_id === m.id && v.metric_key === key,
      )
      row[ch] = v?.value ?? null
    })
    return row
  })

  const revSeries = channels.map(ch => ({
    key: ch,
    label: CHANNEL_LABELS[ch] ?? ch,
    color: CHANNEL_COLORS[ch] ?? '#94a3b8',
  }))

  const channelList = ['amazon_usa', 'amazon_mex', 'amazon_can', 'shopify', 'tiktok_shop', 'walmart']

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sales Channels</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue mix and per-channel KPIs</p>
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No data available. Upload a KPI workbook to get started.
        </div>
      )}

      {months.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Channel Revenue Mix</h2>
            <StackedBarChart
              data={revMixData}
              series={revSeries}
              unit="currency"
              stacked={true}
            />
          </div>

          {channelList.map(ch => (
            <div key={ch}>
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                {CHANNEL_LABELS[ch] ?? ch}
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase">Metric</th>
                      <th className="py-2 px-4 text-right text-xs font-medium text-slate-500 uppercase">Value</th>
                      <th className="py-2 px-4 text-right text-xs font-medium text-slate-500 uppercase">MoM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.filter(m => m.section === 'channels' && m.channel === ch)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(m => {
                        const cur = currentVals.find(v => v.metric_key === m.key)
                        const pri = priorVals.find(v => v.metric_key === m.key)
                        const mom = formatMoMDelta(cur?.value, pri?.value, m.lowerIsBetter, m.unit)
                        return (
                          <tr key={m.key} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className={`py-2 px-4 text-sm text-slate-700 ${m.parentKey ? 'pl-8 text-slate-500' : ''}`}>
                              {m.label}
                            </td>
                            <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                              {formatValue(cur?.value, m.unit)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right">
                              {mom ? (
                                <span className={`font-medium ${mom.isGood === true ? 'text-green-600' : mom.isGood === false ? 'text-red-500' : 'text-slate-400'}`}>
                                  {mom.direction === 'up' ? '↑' : mom.direction === 'down' ? '↓' : '→'} {mom.pctDisplay}
                                </span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Cross-channel ads */}
          <SectionTable
            section="channels"
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
          />
        </>
      )}
    </div>
  )
}
