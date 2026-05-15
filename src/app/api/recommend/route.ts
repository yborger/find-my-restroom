import { recommendRestrooms } from '@/lib/recommend'
import type { UserPreferences } from '@/types/database'
import { getNearbyRestrooms } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

function isUserPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  const urgency = o.urgency
  const needs = o.needs_accessible
  const tol = o.access_tolerance
  return (
    (urgency === 1 || urgency === 2 || urgency === 3 || urgency === 4) &&
    typeof needs === 'boolean' &&
    (tol === 'any' || tol === 'free_or_purchase' || tol === 'free_only')
  )
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected JSON object' }, { status: 400 })
  }

  const { lat, lng, preferences } = body as Record<string, unknown>

  if (typeof lat !== 'number' || !Number.isFinite(lat)) {
    return NextResponse.json(
      { error: 'lat must be a finite number' },
      { status: 400 },
    )
  }
  if (typeof lng !== 'number' || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: 'lng must be a finite number' },
      { status: 400 },
    )
  }
  if (!isUserPreferences(preferences)) {
    return NextResponse.json(
      { error: 'preferences must include urgency (1–4), needs_accessible (boolean), and access_tolerance' },
      { status: 400 },
    )
  }

  const nearby = await getNearbyRestrooms(lat, lng, 3000)
  const recommendations = recommendRestrooms(nearby, preferences)

  return NextResponse.json({ recommendations })
}
