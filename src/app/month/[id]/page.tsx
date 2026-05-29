import { getMonthDetail, getAllMonths } from '@/lib/kpi-queries'
import { SectionTable } from '@/components/kpi/SectionTable'
import { SkuTable } from '@/components/kpi/SkuTable'
import { SECTION_LABELS } from '@/lib/metrics'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MonthDetailPage({ params }: Props) {
  const { id } = await params
  const detail = await getMonthDetail(id)
  if (!detail) return notFound()

  const { month, values } = detail

  // Get prior month for MoM
  const allMonths = await getAllMonths()
  const sortedMonths = [...allMonths].sort((a, b) => a.period.localeCompare(b.period))
  const idx = sortedMonths.findIndex(m => m.id === id)
  const priorMonthId = idx > 0 ? sortedMonths[idx - 1].id : null

  let priorValues: typeof values = []
  if (priorMonthId) {
    const priorDetail = await getMonthDetail(priorMonthId)
    priorValues = priorDetail?.values ?? []
  }

  const sections = Object.keys(SECTION_LABELS).filter(s => s !== 'ops')

  return (
    <div className="max-w-4xl mx-auto space-y-2">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/overview" className="text-slate-400 hover:text-slate-600 text-sm">
          ← Overview
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{month.label}</h1>
          <p className="text-slate-500 text-sm">{month.quarter} · {month.source_filename ?? 'No file'}</p>
        </div>
      </div>

      {sections.map(section => (
        <SectionTable
          key={section}
          section={section}
          currentValues={values as { metric_key: string; sku?: string | null; value: number | null }[]}
          priorValues={priorValues as { metric_key: string; sku?: string | null; value: number | null }[]}
        />
      ))}

      {/* Operations non-SKU */}
      <SectionTable
        section="ops"
        currentValues={values as { metric_key: string; sku?: string | null; value: number | null }[]}
        priorValues={priorValues as { metric_key: string; sku?: string | null; value: number | null }[]}
      />

      {/* SKU tables */}
      <SkuTable
        metricKey="ops_stockout_days"
        metricLabel="Amazon Stockout Days (# of Days < 60D)"
        unit="int"
        lowerIsBetter={true}
        currentValues={values as { metric_key: string; sku?: string | null; value: number | null }[]}
        priorValues={priorValues as { metric_key: string; sku?: string | null; value: number | null }[]}
        warnThreshold={0}
      />

      <SkuTable
        metricKey="ops_avg_inventory_days"
        metricLabel="Average Days of Inventory"
        unit="int"
        lowerIsBetter={false}
        currentValues={values as { metric_key: string; sku?: string | null; value: number | null }[]}
        priorValues={priorValues as { metric_key: string; sku?: string | null; value: number | null }[]}
        warnThreshold={30}
      />
    </div>
  )
}
