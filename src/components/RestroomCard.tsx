'use client'

import type { Restroom, Review } from '@/types/database'
import {
  Accessibility,
  Clock,
  DoorOpen,
  KeyRound,
  ShoppingBag,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export interface RestroomCardProps {
  restroom: Restroom
  reviews: Review[]
  onClose: () => void
  onRate: (score: number) => void
  onReviewSubmit: (comment: string) => void
  rated: boolean
  currentUserId: string | null
}

function formatReviewTime(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffM = diffMs / (1000 * 60)
  const diffH = diffMs / (1000 * 60 * 60)
  const diffD = diffMs / (1000 * 60 * 60 * 24)
  if (diffM < 60) return 'just now'
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  if (diffD < 7) return `${Math.floor(diffD)}d ago`
  return d.toLocaleDateString()
}

function accessMeta(type: Restroom['access_type']) {
  switch (type) {
    case 'free':
      return {
        Icon: DoorOpen,
        label: 'Free',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      }
    case 'purchase_required':
      return {
        Icon: ShoppingBag,
        label: 'Purchase required',
        className: 'bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30',
      }
    case 'code_required':
      return {
        Icon: KeyRound,
        label: 'Code required',
        className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      }
  }
}

export function RestroomCard({
  restroom,
  reviews,
  onClose,
  onRate,
  onReviewSubmit,
  rated,
  currentUserId,
}: RestroomCardProps) {
  const [hoverScore, setHoverScore] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const access = accessMeta(restroom.access_type)
  const AccessIcon = access.Icon
  const avg = restroom.avg_cleanliness
  const filledStars = avg != null ? Math.min(5, Math.max(0, Math.round(avg))) : 0

  function handleReviewSubmit() {
    const t = reviewText.trim()
    if (!t) return
    onReviewSubmit(t)
    setReviewText('')
  }

  const displayReviews = reviews.slice(0, 5)

  return (
    <div className="flex flex-col text-[var(--foreground)]">
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-lg font-bold text-white">{restroom.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 text-[var(--muted)] transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="size-[18px]" />
        </button>
      </div>

      <p className="mt-1 text-sm text-[#888]">{restroom.address}</p>

      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${access.className}`}
        >
          <AccessIcon className="size-3.5 shrink-0" aria-hidden />
          {access.label}
        </span>
        {restroom.is_accessible ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
            <Accessibility className="size-3.5 shrink-0" aria-hidden />
            Accessible
          </span>
        ) : null}
        <span className="inline-flex max-w-full items-center gap-1 text-xs text-[var(--muted)]">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {restroom.hours?.trim() ? restroom.hours : 'Hours unknown'}
        </span>
      </div>

      <div className="mt-3">
        {avg != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--gold)]" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{i < filledStars ? '★' : '☆'}</span>
              ))}
            </span>
            <span className="text-sm text-white">{avg.toFixed(1)}</span>
            <span className="text-sm text-[var(--muted)]">
              ({restroom.review_count} ratings)
            </span>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No ratings yet</p>
        )}
      </div>

      <div className="mt-3">
        {currentUserId == null ? (
          <p className="text-sm">
            <Link href="/login" className="text-[var(--gold)] hover:underline">
              Sign in to rate
            </Link>
          </p>
        ) : rated ? (
          <p className="text-sm text-green-400">Thanks for rating! ✓</p>
        ) : (
          <div>
            <p className="text-sm text-[var(--muted)]">Rate this:</p>
            <div
              className="mt-1 flex gap-0.5"
              role="group"
              aria-label="Rate cleanliness 1 to 5"
            >
              {[1, 2, 3, 4, 5].map((score) => {
                const active = hoverScore > 0 ? score <= hoverScore : false
                return (
                  <button
                    key={score}
                    type="button"
                    className={`text-xl transition ${
                      active
                        ? 'text-[var(--gold)]'
                        : 'text-gray-500 hover:text-[var(--gold)]'
                    }`}
                    onMouseEnter={() => setHoverScore(score)}
                    onMouseLeave={() => setHoverScore(0)}
                    onClick={() => onRate(score)}
                    aria-label={`Rate ${score} out of 5`}
                  >
                    ★
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="my-3 border-t border-gray-800" />

      <h3 className="text-sm font-semibold text-white">Reviews</h3>

      {displayReviews.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          No reviews yet. Be the first!
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {displayReviews.map((r) => (
            <li key={r.id}>
              <p className="text-sm text-gray-300">{r.comment}</p>
              <p className="mt-0.5 text-xs text-[#888]">
                {formatReviewTime(r.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        {currentUserId == null ? (
          <p className="text-sm">
            <Link href="/login" className="text-[var(--gold)] hover:underline">
              Sign in to leave a review
            </Link>
          </p>
        ) : (
          <>
            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share what you found..."
              className="mt-1 w-full resize-none rounded-lg border border-gray-700 bg-[#2a2a2a] p-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gray-600"
            />
            <button
              type="button"
              onClick={handleReviewSubmit}
              className="mt-1 rounded-lg bg-[var(--gold)] px-3 py-1 text-sm font-medium text-black transition hover:opacity-90"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  )
}
