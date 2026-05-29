'use client'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface Props {
  preview: PreviewData
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
  monthOverride?: string
  onMonthOverrideChange?: (month: string) => void
}

export function ParsePreview({
  preview,
  onConfirm,
  onCancel,
  isConfirming,
  monthOverride,
  onMonthOverrideChange,
}: Props) {
  const displayMonth = monthOverride || preview.detectedMonth || '(unknown)'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Parse Preview</h3>
          <p className="text-sm text-slate-500 mt-0.5">{preview.filename}</p>
        </div>
        <Badge variant={preview.matchedCount > 0 ? 'success' : 'warning'}>
          {preview.matchedCount} metrics matched
        </Badge>
      </div>

      {/* Month detection */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 w-28 shrink-0">Month</label>
        <div className="flex items-center gap-2">
          {preview.detectedMonth ? (
            <span className="flex items-center gap-1 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              {preview.detectedMonth}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              Not detected
            </span>
          )}
          {onMonthOverrideChange && (
            <input
              type="month"
              value={monthOverride ?? ''}
              onChange={e => onMonthOverrideChange(e.target.value)}
              className="ml-2 text-sm border border-slate-300 rounded px-2 py-1"
              placeholder="Override YYYY-MM"
            />
          )}
        </div>
      </div>

      {/* Granular counts */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Granular report rows</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(preview.granularCounts).map(([key, count]) => (
            <div key={key} className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-sm font-semibold text-slate-900">{count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {preview.warnings.length > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Warnings ({preview.warnings.length})
          </p>
          <ul className="text-xs text-yellow-700 space-y-0.5">
            {preview.warnings.slice(0, 10).map((w, i) => <li key={i}>{w}</li>)}
            {preview.warnings.length > 10 && <li>… and {preview.warnings.length - 10} more</li>}
          </ul>
        </div>
      )}

      {/* Unmatched labels */}
      {preview.unmatchedLabels.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Unmatched labels ({preview.unmatchedLabels.length})
          </p>
          <ul className="text-xs text-slate-500 space-y-0.5">
            {preview.unmatchedLabels.slice(0, 10).map((l, i) => <li key={i} className="font-mono">{l}</li>)}
            {preview.unmatchedLabels.length > 10 && <li>… and {preview.unmatchedLabels.length - 10} more</li>}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onConfirm} disabled={isConfirming || (!preview.detectedMonth && !monthOverride)}>
          {isConfirming ? 'Saving…' : `Confirm & Save for ${displayMonth}`}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
