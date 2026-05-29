import { NextRequest, NextResponse } from 'next/server'
import { execGetKpiValues, GetKpiValuesInputSchema } from '@/lib/ai-tools'

function checkApiKey(req: NextRequest): boolean {
  const apiKey = process.env.KPI_API_KEY
  if (!apiKey) return false
  const header = req.headers.get('authorization')
  return header === `Bearer ${apiKey}`
}

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const metricsParam = searchParams.get('metrics')
  const monthsParam = searchParams.get('months')

  const input = GetKpiValuesInputSchema.parse({
    metrics: metricsParam ? metricsParam.split(',') : undefined,
    months: monthsParam ? monthsParam.split(',') : undefined,
  })

  const result = await execGetKpiValues(input)
  return NextResponse.json(result)
}
