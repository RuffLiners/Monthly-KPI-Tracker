import * as XLSX from 'xlsx'
import { METRICS, METRIC_BY_LABEL, SKU_LIST, normalizeLabel, type MetricDef } from './metrics'

export interface ParsedKpiRow {
  metricKey: string
  sku?: string
  value: number | null
  rawText: string
}

export interface WorkbookParseResult {
  detectedMonth: string | null
  matchedMetrics: ParsedKpiRow[]
  unmatchedLabels: string[]
  warnings: string[]
}

export function detectMonthFromFilename(filename: string): string | null {
  // Matches "26_03_..." => 2026-03
  const m = filename.match(/^(\d{2})_(\d{2})_/)
  if (!m) return null
  return `20${m[1]}-${m[2]}`
}

// Channel header labels that set current channel context
const CHANNEL_HEADERS: Record<string, string> = {
  'amazon usa':     'amazon_usa',
  'amazon mex':     'amazon_mex',
  'amazon mexico':  'amazon_mex',
  'amazon can':     'amazon_can',
  'amazon canada':  'amazon_can',
  'shopify':        'shopify',
  'tiktok shop':    'tiktok_shop',
  'walmart':        'walmart',
}

function coerceValue(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number') {
    return raw
  }
  if (typeof raw === 'string') {
    if (raw.trim() === '') return null
    // Duration string "H:MM:SS"
    const durationMatch = raw.match(/^(\d+):(\d{2}):(\d{2})$/)
    if (durationMatch) {
      return (
        parseInt(durationMatch[1]) * 3600 +
        parseInt(durationMatch[2]) * 60 +
        parseInt(durationMatch[3])
      )
    }
    const n = parseFloat(raw.replace(/[$,%\s]/g, ''))
    return isNaN(n) ? null : n
  }
  return null
}

function excelFractionToSeconds(fraction: number): number {
  return Math.round(fraction * 86400)
}

function isDurationFraction(value: number, unit: string): boolean {
  return unit === 'duration' && value > 0 && value < 1
}

export function parseSummaryTab(buffer: Buffer, filename: string): WorkbookParseResult {
  const wb = XLSX.read(buffer, {
    type: 'buffer',
    dense: true,
    cellFormula: false,
    cellText: false,
    cellNF: false,
    sheetStubs: false,
  })

  const summarySheet = wb.Sheets['Monthly KPI Summary']
  if (!summarySheet) {
    throw new Error('Tab "Monthly KPI Summary" not found in workbook')
  }

  // sheet_to_json with header:1 returns unknown[][]
  const rawRows = XLSX.utils.sheet_to_json(summarySheet, {
    header: 1,
    defval: undefined,
    blankrows: false,
  }) as unknown[][]

  const result: WorkbookParseResult = {
    detectedMonth: detectMonthFromFilename(filename),
    matchedMetrics: [],
    unmatchedLabels: [],
    warnings: [],
  }

  let currentChannel: string | null = null
  let currentSkuMetricKey: string | null = null

  for (const row of rawRows) {
    const labelRaw = row[0]
    const valueRaw = row[1]

    if (labelRaw === undefined || labelRaw === null || String(labelRaw).trim() === '') continue

    const trimmed = String(labelRaw).trim()
    const normalized = normalizeLabel(trimmed)
    const isBlankValue = valueRaw === undefined

    // Section/channel headers have blank B column
    if (isBlankValue) {
      const channelKey = CHANNEL_HEADERS[normalized]
      if (channelKey) {
        currentChannel = channelKey
      }
      currentSkuMetricKey = null
      continue
    }

    const isChild = trimmed.startsWith('>')

    // Look up metric — prefer channel match
    const candidates = METRIC_BY_LABEL.get(normalized)
    let def: MetricDef | undefined

    if (candidates) {
      if (currentChannel) {
        def = candidates.find(c => c.channel === currentChannel) ?? candidates[0]
      } else {
        def = candidates[0]
      }
    }

    if (!def) {
      // Check if it's a SKU under a SKU-metric block
      if (currentSkuMetricKey && SKU_LIST.includes(trimmed)) {
        const rawNum = coerceValue(valueRaw)
        const skuMetricDef = METRICS.find(m => m.key === currentSkuMetricKey)
        let numValue = rawNum
        if (numValue !== null && skuMetricDef && isDurationFraction(numValue, skuMetricDef.unit)) {
          numValue = excelFractionToSeconds(numValue)
        }
        result.matchedMetrics.push({
          metricKey: currentSkuMetricKey,
          sku: trimmed,
          value: numValue,
          rawText: String(valueRaw ?? ''),
        })
        continue
      }
      result.unmatchedLabels.push(trimmed)
      continue
    }

    if (!isChild) {
      currentSkuMetricKey = null
    }

    if (def.isSkuMetric) {
      currentSkuMetricKey = def.key
    }

    let numValue = coerceValue(valueRaw)

    if (numValue !== null && isDurationFraction(numValue, def.unit)) {
      numValue = excelFractionToSeconds(numValue)
    }

    result.matchedMetrics.push({
      metricKey: def.key,
      value: numValue,
      rawText: String(valueRaw ?? ''),
    })
  }

  return result
}
