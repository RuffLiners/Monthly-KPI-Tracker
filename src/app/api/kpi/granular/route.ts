import { NextRequest, NextResponse } from 'next/server'
import { execQueryGranular, QueryGranularInputSchema } from '@/lib/ai-tools'

function checkApiKey(req: NextRequest): boolean {
  const apiKey = process.env.KPI_API_KEY
  if (!apiKey) return false
  return req.headers.get('authorization') === `Bearer ${apiKey}`
}

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const input = QueryGranularInputSchema.parse(body)
  const result = await execQueryGranular(input)
  return NextResponse.json(result)
}
