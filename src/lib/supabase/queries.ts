import type { Restroom, Review } from '@/types/database'
import { adminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Recomputes `avg_cleanliness` and `review_count` for a restroom from `ratings`,
 * equivalent to:
 * UPDATE restrooms SET avg_cleanliness = (SELECT AVG(cleanliness_score) ...),
 *   review_count = (SELECT COUNT(*) ...) WHERE id = $1
 */
async function refreshRestroomRatingAggregates(
  restroomId: string,
): Promise<boolean> {
  if (!adminClient) {
    return false
  }

  try {
    const { data: scores, error: ratingsError } = await adminClient
      .from('ratings')
      .select('cleanliness_score')
      .eq('restroom_id', restroomId)

    if (ratingsError) {
      return false
    }

    const rows = scores ?? []
    const reviewCount = rows.length
    const avgCleanliness =
      reviewCount === 0
        ? null
        : rows.reduce((sum, row) => sum + Number(row.cleanliness_score), 0) /
          reviewCount

    const { error: updateError } = await adminClient
      .from('restrooms')
      .update({
        avg_cleanliness: avgCleanliness,
        review_count: reviewCount,
      })
      .eq('id', restroomId)

    return !updateError
  } catch {
    return false
  }
}

export async function getNearbyRestrooms(
  lat: number,
  lng: number,
  radiusMeters = 2000,
): Promise<Restroom[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('nearby_restrooms', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radiusMeters,
    })

    if (error || !data) {
      return []
    }

    return data as Restroom[]
  } catch {
    return []
  }
}

export async function getReviews(restroomId: string): Promise<Review[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('restroom_id', restroomId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !data) {
      return []
    }

    return data as Review[]
  } catch {
    return []
  }
}

export async function submitRating(
  restroomId: string,
  score: number,
  userId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error: upsertError } = await supabase.from('ratings').upsert(
      {
        restroom_id: restroomId,
        user_id: userId,
        cleanliness_score: score,
      },
      { onConflict: 'restroom_id,user_id' },
    )

    if (upsertError) {
      return false
    }

    return await refreshRestroomRatingAggregates(restroomId)
  } catch {
    return false
  }
}

export async function submitReview(
  restroomId: string,
  comment: string,
  userId: string,
): Promise<Review | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        restroom_id: restroomId,
        user_id: userId,
        comment,
      })
      .select()
      .single()

    if (error || !data) {
      return null
    }

    return data as Review
  } catch {
    return null
  }
}
