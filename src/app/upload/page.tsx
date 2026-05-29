'use client'
import { useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { ParsePreview } from '@/components/upload/ParsePreview'
import { UploadHistory } from '@/components/upload/UploadHistory'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GranularCounts {
  orders: number
  shopifySales: number
  adPerformance: number
  tiktokAffiliates: number
  tiktokGmvSpend: number
  inventoryLedger: number
  delivery: number
  searchQuery: number
}

interface PreviewData {
  detectedMonth: string | null
  filename: string
  matchedCount: number
  unmatchedLabels: string[]
  warnings: string[]
  granularCounts: GranularCounts
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [monthOverride, setMonthOverride] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setPreview(null)
    setSuccess(null)
    setError(null)
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('file', f)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Parse failed')
      setPreview(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!file || !preview) return
    setConfirming(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      if (monthOverride) fd.append('month', monthOverride)

      const res = await fetch('/api/upload/confirm', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')

      setSuccess(`Saved ${data.label} — ${data.matchedMetrics} metrics (v${data.version})`)
      setPreview(null)
      setFile(null)
      setMonthOverride('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setPreview(null)
    setMonthOverride('')
    setError(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload KPI Workbook</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your monthly Excel KPI report to parse and store all metrics.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!preview && (
        <DropZone onFile={handleFile} isLoading={loading} />
      )}

      {loading && (
        <div className="text-center py-4 text-slate-500 text-sm">Parsing workbook…</div>
      )}

      {preview && (
        <ParsePreview
          preview={preview}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isConfirming={confirming}
          monthOverride={monthOverride}
          onMonthOverrideChange={setMonthOverride}
        />
      )}

      <div className="border-t border-slate-200 pt-6">
        <UploadHistory />
      </div>
    </div>
  )
}
