'use client'

import { AuthButton } from '@/components/AuthButton'
import { PreferencePanel } from '@/components/PreferencePanel'
import { RecommendationPanel } from '@/components/RecommendationPanel'
import { RestroomCard } from '@/components/RestroomCard'
import { createClient } from '@/lib/supabase/client'
import type {
  Restroom,
  Review,
  UserPreferences,
} from '@/types/database'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }} />
  ),
})

const NYC_LAT = 40.7128
const NYC_LNG = -74.006

export default function Home() {
  const router = useRouter()
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])

  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [restrooms, setRestrooms] = useState<Restroom[]>([])
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(
    null,
  )
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([])
  const [recommendations, setRecommendations] = useState<Restroom[] | null>(
    null,
  )
  const [recLoading, setRecLoading] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    urgency: 2,
    needs_accessible: false,
    access_tolerance: 'any',
  })
  const [rated, setRated] = useState(false)
  const [locationError, setLocationError] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const loadRestrooms = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `/api/restrooms?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      )
      if (!res.ok) {
        setRestrooms([])
        return
      }
      const data: unknown = await res.json()
      setRestrooms(Array.isArray(data) ? (data as Restroom[]) : [])
    } catch {
      setRestrooms([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    if (supabase) {
      void supabase.auth.getUser().then(({ data: { user } }) => {
        if (!cancelled) setCurrentUserId(user?.id ?? null)
      })
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLat(lat)
        setUserLng(lng)
        await loadRestrooms(lat, lng)
      },
      async () => {
        if (cancelled) return
        setLocationError(true)
        setUserLat(NYC_LAT)
        setUserLng(NYC_LNG)
        await loadRestrooms(NYC_LAT, NYC_LNG)
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )

    return () => {
      cancelled = true
    }
  }, [loadRestrooms, supabase])

  const handleSelectRestroom = useCallback(async (r: Restroom) => {
    setSelectedRestroom(r)
    setRated(false)
    try {
      const res = await fetch(
        `/api/reviews?restroomId=${encodeURIComponent(r.id)}`,
      )
      if (!res.ok) {
        setSelectedReviews([])
        return
      }
      const data: unknown = await res.json()
      setSelectedReviews(Array.isArray(data) ? (data as Review[]) : [])
    } catch {
      setSelectedReviews([])
    }
  }, [])

  const handleGetRecommendation = useCallback(async () => {
    const lat = userLat ?? NYC_LAT
    const lng = userLng ?? NYC_LNG
    setRecLoading(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, preferences }),
      })
      if (!res.ok) {
        setRecommendations([])
        return
      }
      const data = (await res.json()) as { recommendations?: Restroom[] }
      setRecommendations(data.recommendations ?? [])
    } catch {
      setRecommendations([])
    } finally {
      setRecLoading(false)
    }
  }, [preferences, userLat, userLng])

  const handleRate = useCallback(
    async (score: number) => {
      if (!currentUserId) {
        router.push('/login')
        return
      }
      if (!selectedRestroom) return
      try {
        const res = await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restroom_id: selectedRestroom.id,
            cleanliness_score: score,
          }),
        })
        if (res.ok) setRated(true)
      } catch {
        /* ignore */
      }
    },
    [currentUserId, router, selectedRestroom],
  )

  const handleReviewSubmit = useCallback(
    async (comment: string) => {
      if (!selectedRestroom || !currentUserId) return
      const optimistic: Review = {
        id: `optimistic-${Date.now()}`,
        restroom_id: selectedRestroom.id,
        user_id: currentUserId,
        comment,
        created_at: new Date().toISOString(),
      }
      setSelectedReviews((prev) => [optimistic, ...prev])
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restroom_id: selectedRestroom.id,
            comment,
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as { review?: Review }
          const review = data.review
          if (review) {
            setSelectedReviews((prev) => [
              review,
              ...prev.filter((r) => r.id !== optimistic.id),
            ])
          } else {
            setSelectedReviews((prev) =>
              prev.filter((r) => r.id !== optimistic.id),
            )
          }
        } else {
          setSelectedReviews((prev) =>
            prev.filter((r) => r.id !== optimistic.id),
          )
        }
      } catch {
        setSelectedReviews((prev) =>
          prev.filter((r) => r.id !== optimistic.id),
        )
      }
    },
    [currentUserId, selectedRestroom],
  )

  const mapLat = userLat ?? NYC_LAT
  const mapLng = userLng ?? NYC_LNG
  const showLocationOverlay = userLat === null && !locationError

  return (
    <div
      className="relative overflow-hidden bg-[#0a0a0a]"
      style={{ width: '100vw', height: '100vh' }}
    >
      <div className="absolute inset-0 z-0">
        <Map
          restrooms={restrooms}
          onRestroomClick={handleSelectRestroom}
          selectedId={selectedRestroom?.id ?? null}
          recommendedIds={recommendations?.map((r) => r.id) ?? []}
          userLat={mapLat}
          userLng={mapLng}
        />
      </div>

      <aside
        className={`fixed z-10 flex flex-col gap-4 overflow-y-auto bg-[#111] p-5 md:right-0 md:top-0 md:h-screen md:w-[380px] md:max-h-none md:rounded-none ${
          selectedRestroom ? 'min-h-[60vh] md:min-h-0' : ''
        } bottom-0 left-0 right-0 max-h-[85vh] w-full rounded-t-2xl md:left-auto`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-playfair text-2xl text-[#f0b429]">
              Find My Restroom
            </h1>
            <p className="mt-0.5 text-xs italic text-[#888]">
              Your guide to the good ones.
            </p>
          </div>
          <AuthButton />
        </div>

        {locationError ? (
          <p className="text-xs text-yellow-400/90">
            Using default location — allow location access for better results
          </p>
        ) : null}

        <PreferencePanel
          preferences={preferences}
          onChange={setPreferences}
          onGetRecommendation={handleGetRecommendation}
          loading={recLoading}
        />

        <RecommendationPanel
          recommendations={recommendations}
          loading={recLoading}
          onSelect={handleSelectRestroom}
        />

        {selectedRestroom ? (
          <>
            <div className="border-t border-gray-800" />
            <RestroomCard
              restroom={selectedRestroom}
              reviews={selectedReviews}
              onClose={() => setSelectedRestroom(null)}
              onRate={handleRate}
              onReviewSubmit={handleReviewSubmit}
              rated={rated}
              currentUserId={currentUserId}
            />
          </>
        ) : null}
      </aside>

      {showLocationOverlay ? (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2
            className="size-8 animate-spin text-[#f0b429]"
            aria-hidden
          />
          <p className="text-sm text-[#888]">Finding your location...</p>
        </div>
      ) : null}
    </div>
  )
}
