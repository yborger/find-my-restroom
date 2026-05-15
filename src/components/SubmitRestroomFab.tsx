'use client'

import type { Restroom } from '@/types/database'
import { Plus, X } from 'lucide-react'
import { useCallback, useState } from 'react'

type AccessFormValue = Restroom['access_type']

const ACCESS_OPTIONS: { value: AccessFormValue; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'purchase_required', label: 'Purchase Required' },
  { value: 'code_required', label: 'Code Required' },
]

export function SubmitRestroomFab({
  lat,
  lng,
}: {
  lat: number
  lng: number
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [accessType, setAccessType] = useState<AccessFormValue>('free')
  const [isAccessible, setIsAccessible] = useState(false)
  const [hours, setHours] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = useCallback(() => {
    setName('')
    setAddress('')
    setAccessType('free')
    setIsAccessible(false)
    setHours('')
    setError(null)
    setSuccess(false)
  }, [])

  const openModal = useCallback(() => {
    resetForm()
    setOpen(true)
  }, [resetForm])

  const closeModal = useCallback(() => {
    resetForm()
    setOpen(false)
  }, [resetForm])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/restrooms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          lat,
          lng,
          access_type: accessType,
          is_accessible: isAccessible,
          hours: hours.trim() || undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        success?: boolean
      }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.')
        return
      }
      setSuccess(true)
      window.setTimeout(() => {
        closeModal()
      }, 2000)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-gray-500'

  return (
    <>
      <button
        type="button"
        aria-label="Submit a restroom"
        onClick={openModal}
        className="fixed bottom-4 right-4 z-20 flex size-14 items-center justify-center rounded-full bg-[#f0b429] text-black shadow-lg transition hover:opacity-90 md:bottom-4 md:left-4 md:right-auto"
      >
        <Plus size={20} strokeWidth={2.25} aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-restroom-title"
            className="relative flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-[#1a1a1a] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-1 text-[#888] transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <h2
              id="submit-restroom-title"
              className="mb-2 pr-8 font-semibold text-white"
            >
              Submit a Restroom
            </h2>

            {success ? (
              <p className="text-sm text-green-400">
                ✓ Submitted! We&apos;ll review it shortly.
              </p>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                  required
                  className={fieldClass}
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
                <input
                  required
                  className={fieldClass}
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
                <div>
                  <label
                    htmlFor="access-type"
                    className="mb-1 block text-xs text-[#888]"
                  >
                    Access type
                  </label>
                  <select
                    id="access-type"
                    className={fieldClass}
                    value={accessType}
                    onChange={(e) =>
                      setAccessType(e.target.value as AccessFormValue)
                    }
                  >
                    {ACCESS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={isAccessible}
                    onChange={(e) => setIsAccessible(e.target.checked)}
                    className="size-4 rounded border-gray-600"
                  />
                  Accessible bathroom
                </label>
                <input
                  className={fieldClass}
                  placeholder="e.g. 8am–10pm or 24hrs"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                {error ? (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 w-full rounded-lg bg-[#f0b429] py-2.5 text-sm font-bold text-black transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
