'use client'

import type { UserPreferences } from '@/types/database'
import { Loader2 } from 'lucide-react'

export interface PreferencePanelProps {
  preferences: UserPreferences
  onChange: (p: UserPreferences) => void
  onGetRecommendation: () => void
  loading: boolean
}

const URGENCY: { value: UserPreferences['urgency']; label: string }[] = [
  { value: 1, label: '🧘 Relaxed' },
  { value: 2, label: '🚶 Normal' },
  { value: 3, label: '🏃 Urgent' },
  { value: 4, label: '🚨 Desperate' },
]

const ACCESS: {
  value: UserPreferences['access_tolerance']
  label: string
}[] = [
  { value: 'any', label: 'Any' },
  { value: 'free_or_purchase', label: 'Buy something' },
  { value: 'free_only', label: 'Free only' },
]

export function PreferencePanel({
  preferences,
  onChange,
  onGetRecommendation,
  loading,
}: PreferencePanelProps) {
  return (
    <div className="flex flex-col text-[var(--foreground)]">
      <p className="mb-1.5 text-xs text-[var(--muted)]">How urgent?</p>
      <div className="grid grid-cols-4 gap-1">
        {URGENCY.map(({ value, label }) => {
          const active = preferences.urgency === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...preferences, urgency: value })}
              className={`rounded-full py-1.5 text-sm transition ${
                active
                  ? 'bg-[var(--gold)] font-semibold text-black'
                  : 'bg-[#2a2a2a] text-[#888] hover:bg-[#333]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--foreground)]">Accessible only</span>
        <button
          type="button"
          role="switch"
          aria-checked={preferences.needs_accessible}
          onClick={() =>
            onChange({
              ...preferences,
              needs_accessible: !preferences.needs_accessible,
            })
          }
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            preferences.needs_accessible
              ? 'bg-[var(--gold)]'
              : 'bg-[#3f3f3f]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 block h-6 w-6 rounded-full bg-white shadow transition-transform ${
              preferences.needs_accessible ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="mb-1.5 mt-3 text-xs text-[var(--muted)]">I can:</p>
      <div className="grid grid-cols-3 gap-1">
        {ACCESS.map(({ value, label }) => {
          const active = preferences.access_tolerance === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...preferences, access_tolerance: value })}
              className={`rounded-full py-1.5 text-sm transition ${
                active
                  ? 'bg-[var(--gold)] font-semibold text-black'
                  : 'bg-[#2a2a2a] text-[#888] hover:bg-[#333]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={onGetRecommendation}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] py-3 font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
            <span>Searching...</span>
          </>
        ) : (
          'Find My Restroom →'
        )}
      </button>
    </div>
  )
}
