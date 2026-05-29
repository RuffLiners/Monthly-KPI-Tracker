'use client'
import { useEffect, useState } from 'react'
import { FileSpreadsheet, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface MonthRecord {
  id: string
  period: string
  label: string
  quarter: string
  source_filename?: string
  uploaded_at?: string
}

export function UploadHistory() {
  const [months, setMonths] = useState<MonthRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/months')
    const data = await res.json()
    setMonths(data.months ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <div className="text-sm text-slate-500 py-4">Loading history…</div>
  }

  if (!months.length) {
    return <div className="text-sm text-slate-500 py-4">No uploads yet.</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Upload History</h3>
        <button onClick={load} className="text-slate-400 hover:text-slate-600">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {months.map(m => (
          <Link
            key={m.id}
            href={`/month/${m.id}`}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{m.label}</p>
              <p className="text-xs text-slate-500 truncate">{m.source_filename ?? '—'}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0">{m.quarter}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
