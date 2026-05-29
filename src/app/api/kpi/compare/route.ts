import { NextRequest, NextResponse } from 'next/server'
import { execComparePeriods, ComparePeriodsInputSchema } from '@/lib/ai-tools'

function checkApiKey(req: NextRequest): boolean {
  const apiKey = process.env.KPI_API_KEY
  if (!apiKey) return false
  return req.headers.get('authorization') === `Bearer ${apiKey}`
}

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const input = ComparePeriodsInputSchema.parse({
    metric: searchParams.get('metric'),
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    sku: searchParams.get('sku') ?? undefined,
  })

  const result = await execComparePeriods(input)
  return NextResponse.json(result)
}
