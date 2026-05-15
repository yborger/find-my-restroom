import { getReviews, submitReview } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restroomId = searchParams.get('restroomId')

  if (!restroomId || restroomId.trim() === '') {
    return NextResponse.json(
      { error: 'restroomId query parameter is required' },
      { status: 400 },
    )
  }

  const reviews = await getReviews(restroomId.trim())
  return NextResponse.json(reviews)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected JSON object' }, { status: 400 })
  }

  const { restroom_id, comment } = body as Record<string, unknown>

  if (typeof restroom_id !== 'string' || restroom_id.trim() === '') {
    return NextResponse.json(
      { error: 'restroom_id is required' },
      { status: 400 },
    )
  }

  if (typeof comment !== 'string') {
    return NextResponse.json(
      { error: 'comment must be a string' },
      { status: 400 },
    )
  }

  const trimmed = comment.trim()
  if (trimmed.length === 0) {
    return NextResponse.json(
      { error: 'comment must not be empty' },
      { status: 400 },
    )
  }
  if (trimmed.length >= 500) {
    return NextResponse.json(
      { error: 'comment must be under 500 characters' },
      { status: 400 },
    )
  }

  const review = await submitReview(restroom_id.trim(), trimmed, user.id)

  if (!review) {
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, review })
}
