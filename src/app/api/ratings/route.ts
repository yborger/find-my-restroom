import { submitRating } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const { restroom_id, cleanliness_score } = body as Record<string, unknown>

  if (typeof restroom_id !== 'string' || restroom_id.trim() === '') {
    return NextResponse.json(
      { error: 'restroom_id is required' },
      { status: 400 },
    )
  }

  if (
    typeof cleanliness_score !== 'number' ||
    !Number.isInteger(cleanliness_score) ||
    cleanliness_score < 1 ||
    cleanliness_score > 5
  ) {
    return NextResponse.json(
      { error: 'cleanliness_score must be an integer from 1 to 5' },
      { status: 400 },
    )
  }

  const ok = await submitRating(
    restroom_id.trim(),
    cleanliness_score,
    user.id,
  )

  if (!ok) {
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
