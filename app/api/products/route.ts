import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase.from('products').select('*').eq('is_active', true)
  if (category) query = query.eq('category', category)
  if (featured === 'true') query = query.eq('is_featured', true)
  if (search) query = query.ilike('name', `%${search}%`)
  query = query.limit(limit).order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
