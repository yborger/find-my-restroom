import { adminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const ACCESS_TYPES = ['free', 'purchase_required', 'code_required'] as const

type AccessType = (typeof ACCESS_TYPES)[number]

function isAccessType(value: unknown): value is AccessType {
  return typeof value === 'string' && ACCESS_TYPES.includes(value as AccessType)
}

export async function POST(request: Request) {
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Submissions are temporarily unavailable' },
      { status: 503 },
    )
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

  const o = body as Record<string, unknown>
  const { name, address, lat, lng, access_type, is_accessible, hours } = o

  if (typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (typeof address !== 'string' || address.trim() === '') {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }
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
  if (!isAccessType(access_type)) {
    return NextResponse.json(
      { error: 'access_type must be free, purchase_required, or code_required' },
      { status: 400 },
    )
  }
  if (typeof is_accessible !== 'boolean') {
    return NextResponse.json(
      { error: 'is_accessible must be a boolean' },
      { status: 400 },
    )
  }

  let hoursValue: string | null = null
  if (hours !== undefined && hours !== null) {
    if (typeof hours !== 'string') {
      return NextResponse.json(
        { error: 'hours must be a string when provided' },
        { status: 400 },
      )
    }
    hoursValue = hours
  }

  const { error } = await adminClient.from('restrooms').insert({
    name: name.trim(),
    address: address.trim(),
    lat,
    lng,
    access_type,
    is_accessible,
    hours: hoursValue,
    is_approved: false,
    avg_cleanliness: null,
    review_count: 0,
    location: { type: 'Point', coordinates: [lng, lat] },
  })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Thanks! Your submission is pending review.',
  })
}
