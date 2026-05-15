'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

function truncateEmail(email: string, max = 20) {
  if (email.length <= max) return email
  return `${email.slice(0, max)}…`
}

export function AuthButtonInner() {
  const router = useRouter()
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    supabase.auth.getUser().then(({ data: { user: nextUser } }) => {
      if (!cancelled) setUser(nextUser)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  if (!supabase) {
    return (
      <Link
        href="/login"
        className="text-xs font-medium text-[#f0b429] underline-offset-2 hover:underline"
      >
        Sign in
      </Link>
    )
  }

  if (user) {
    const label = user.email ? truncateEmail(user.email) : 'Account'
    return (
      <div className="flex max-w-full flex-col gap-1 text-xs text-gray-500">
        <span className="truncate" title={user.email ?? undefined}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="self-start text-left text-gray-400 underline-offset-2 hover:text-gray-300 hover:underline"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="text-xs font-medium text-[#f0b429] underline-offset-2 hover:underline"
    >
      Sign in
    </Link>
  )
}
