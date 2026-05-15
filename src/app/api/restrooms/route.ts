import { getNearbyRestrooms } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

function parseFiniteNumber(value: string | null): number | null {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFiniteNumber(searchParams.get('lat'))
  const lng = parseFiniteNumber(searchParams.get('lng'))
  const radiusRaw = searchParams.get('radius')
  const radius =
    radiusRaw === null || radiusRaw === ''
      ? 2000
      : parseFiniteNumber(radiusRaw)

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: 'lat and lng are required and must be valid numbers' },
      { status: 400 },
    )
  }

  if (radius === null) {
    return NextResponse.json(
      { error: 'radius must be a valid number when provided' },
      { status: 400 },
    )
  }

  const restrooms = await getNearbyRestrooms(lat, lng, radius)
  return NextResponse.json(restrooms)
}
