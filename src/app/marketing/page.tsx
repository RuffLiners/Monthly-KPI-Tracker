import { getSectionData } from '@/lib/kpi-queries'
import { SectionTable } from '@/components/kpi/SectionTable'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b']

export default async function MarketingPage() {
  const { months, values } = await getSectionData('marketing', 12)

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

  const followerData = buildChartData([
    'mkt_tiktok_followers',
    'mkt_instagram_followers',
    'mkt_facebook_followers',
    'mkt_email_list',
  ])

  const searchData = buildChartData([
    'mkt_amazon_branded_search',
    'mkt_google_branded_clicks',
    'mkt_google_branded_impressions',
  ])

  const affiliateData = buildChartData(['mkt_affiliate_videos'])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
        <p className="text-slate-500 text-sm mt-1">Audience growth and branded search trends</p>
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No data available. Upload a KPI workbook to get started.
        </div>
      )}

      {months.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Followers & Email List Growth</h2>
            <TrendLineChart
              data={followerData}
              series={[
                { key: 'mkt_tiktok_followers',    label: 'TikTok',    color: COLORS[0] },
                { key: 'mkt_instagram_followers',  label: 'Instagram', color: COLORS[1] },
                { key: 'mkt_facebook_followers',   label: 'Facebook',  color: COLORS[2] },
                { key: 'mkt_email_list',           label: 'Email List',color: COLORS[3] },
              ]}
              unit="int"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Branded Search Performance</h2>
            <TrendLineChart
              data={searchData}
              series={[
                { key: 'mkt_amazon_branded_search',        label: 'Amazon Search', color: COLORS[0] },
                { key: 'mkt_google_branded_clicks',        label: 'Google Clicks', color: COLORS[1] },
                { key: 'mkt_google_branded_impressions',   label: 'Google Impr.',  color: COLORS[2] },
              ]}
              unit="int"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Affiliate Videos Posted</h2>
            <TrendLineChart
              data={affiliateData}
              series={[{ key: 'mkt_affiliate_videos', label: 'Videos', color: COLORS[0] }]}
              unit="int"
            />
          </div>

          <SectionTable
            section="marketing"
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
          />
        </>
      )}
    </div>
  )
}
