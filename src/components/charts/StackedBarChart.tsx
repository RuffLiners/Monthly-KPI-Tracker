'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  height?: number
  stacked?: boolean
}

export function StackedBarChart({
  data,
  series,
  xDataKey = 'label',
  unit = 'currency',
  height = 300,
  stacked = true,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
        {series.map(s => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            stackId={stacked ? 'a' : undefined}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
