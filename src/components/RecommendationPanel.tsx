'use client'

import type { Restroom } from '@/types/database'
import { Accessibility } from 'lucide-react'

export interface RecommendationPanelProps {
  recommendations: Restroom[] | null
  loading: boolean
  onSelect: (r: Restroom) => void
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

function accessLabel(type: Restroom['access_type']): string {
  switch (type) {
    case 'free':
      return 'Free'
    case 'purchase_required':
      return 'Buy'
    case 'code_required':
      return 'Code'
  }
}

function accessPillClass(type: Restroom['access_type']): string {
  switch (type) {
    case 'free':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'purchase_required':
      return 'bg-[var(--gold)]/20 text-[var(--gold)]'
    case 'code_required':
      return 'bg-orange-500/20 text-orange-400'
  }
}

const RANK_BADGE: [string, string][] = [
  ['#1', 'text-[var(--gold)]'],
  ['#2', 'text-[#9ca3af]'],
  ['#3', 'text-[#92400e]'],
]

export function RecommendationPanel({
  recommendations,
  loading,
  onSelect,
}: RecommendationPanelProps) {
  if (recommendations === null && !loading) {
    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-[#2a2a2a]"
          />
        ))}
      </div>
    )
  }

  if (recommendations !== null && recommendations.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--muted)]">
        No restrooms found nearby. Try adjusting your filters.
      </p>
    )
  }

  if (!recommendations?.length) {
    return null
  }

  const top = recommendations.slice(0, 3)

  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--gold)]">
        Best options nearby
      </h3>
      <ul className="flex flex-col gap-2">
        {top.map((restroom, index) => {
          const [rankText, rankClass] = RANK_BADGE[index] ?? [
            `#${index + 1}`,
            'text-[var(--muted)]',
          ]
          const stars =
            restroom.avg_cleanliness != null
              ? `${restroom.avg_cleanliness.toFixed(1)}★`
              : '–'

          return (
            <li key={restroom.id}>
              <button
                type="button"
                onClick={() => onSelect(restroom)}
                className="flex w-full cursor-pointer items-start gap-2 rounded-xl border border-transparent bg-[var(--card)] p-3 text-left transition hover:border-[#f0b429]/30 hover:bg-[#222]"
              >
                <span
                  className={`w-6 shrink-0 text-xs font-bold ${rankClass}`}
                  aria-hidden
                >
                  {rankText}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{restroom.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-[var(--muted)]">
                      {formatDistance(restroom.distance_meters)}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${accessPillClass(restroom.access_type)}`}
                    >
                      {accessLabel(restroom.access_type)}
                    </span>
                    {restroom.is_accessible ? (
                      <Accessibility
                        className="size-3 shrink-0 text-blue-400"
                        aria-label="Accessible"
                      />
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--muted)]">{stars}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
