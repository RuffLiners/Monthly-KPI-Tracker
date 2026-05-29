'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface Props {
  data: { value: number }[]
  color?: string
  width?: number | string
  height?: number
}

export function SparklineChart({
  data,
  color = '#22c55e',
  width = '100%',
  height = 32,
}: Props) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
