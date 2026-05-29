import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const quarter = searchParams.get('quarter')

  let query = supabaseAdmin.from('goals').select('*')
  if (quarter) query = query.eq('quarter', quarter)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ goals: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { metric_key, quarter, target_value, comparator } = body as {
    metric_key: string
    quarter: string
    target_value: number
    comparator: string
  }

  const { data, error } = await supabaseAdmin
    .from('goals')
    .upsert({ metric_key, quarter, target_value, comparator }, { onConflict: 'metric_key,quarter' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ goal: data })
}
