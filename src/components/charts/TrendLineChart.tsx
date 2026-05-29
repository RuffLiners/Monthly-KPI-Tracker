'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatValue } from '@/lib/formatters'

interface Series {
  key: string
  label: string
  color: string
}

interface Props {
  data: Record<string, unknown>[]
  series: Series[]
  xDataKey?: string
  unit?: string
  referenceValue?: number
  referenceLabel?: string
  height?: number
}

export function TrendLineChart({
  data,
  series,
  xDataKey = 'label',
  unit = 'currency',
  referenceValue,
  referenceLabel,
  height = 300,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xDataKey} tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={v => formatValue(v as number, unit)}
          width={80}
        />
        <Tooltip
          formatter={(value: unknown) => [formatValue(value as number, unit), '']}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend />
        {referenceValue !== undefined && (
          <ReferenceLine
            y={referenceValue}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: referenceLabel ?? '', position: 'right', fontSize: 11 }}
          />
        )}
        {series.map(s => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
