export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatInt(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return '—'
  switch (unit) {
    case 'currency': return formatCurrency(value)
    case 'percent':  return formatPercent(value)
    case 'duration': return formatDuration(value)
    case 'int':      return formatInt(value)
    default:         return String(value)
  }
}

export interface MoMResult {
  display: string
  pctDisplay: string
  direction: 'up' | 'down' | 'flat'
  isGood: boolean | null
}

export function formatMoMDelta(
  current: number | null | undefined,
  prior: number | null | undefined,
  lowerIsBetter: boolean,
  unit: string,
): MoMResult | null {
  if (current == null || prior == null || prior === 0) return null
  const delta = current - prior
  const pct = delta / Math.abs(prior)
  const direction: 'up' | 'down' | 'flat' =
    delta > 0.0001 ? 'up' : delta < -0.0001 ? 'down' : 'flat'
  const isGood =
    direction === 'flat'
      ? null
      : lowerIsBetter
      ? direction === 'down'
      : direction === 'up'
  return {
    display: formatValue(delta, unit),
    pctDisplay: `${pct >= 0 ? '+' : ''}${(pct * 100).toFixed(1)}%`,
    direction,
    isGood,
  }
}

export function getQuarterForPeriod(period: string): string {
  const [year, month] = period.split('-')
  const q = Math.ceil(parseInt(month) / 3)
  return `${year}-Q${q}`
}
