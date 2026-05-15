'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

type Tab = 'signin' | 'signup'

export function LoginForm() {
  const router = useRouter()
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Sign-in is not available (missing configuration).')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Sign-up is not available (missing configuration).')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  const inputClass =
    'w-full rounded-lg border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-white placeholder:text-gray-500 outline-none focus:border-gray-500'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] p-8 shadow-xl">
        <h1 className="font-playfair mb-8 text-center text-2xl font-semibold text-[#f0b429]">
          Find My Restroom
        </h1>

        <div className="mb-6 flex rounded-lg bg-[#2a2a2a] p-1">
          <button
            type="button"
            onClick={() => {
              setTab('signin')
              setError(null)
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === 'signin'
                ? 'bg-[#1a1a1a] text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup')
              setError(null)
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === 'signup'
                ? 'bg-[#1a1a1a] text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form
          onSubmit={tab === 'signin' ? handleSignIn : handleSignUp}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-gray-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              disabled={!supabase}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs text-gray-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                tab === 'signin' ? 'current-password' : 'new-password'
              }
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              disabled={!supabase}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !supabase}
            className="mt-2 rounded-lg bg-[#f0b429] px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting
              ? 'Please wait…'
              : tab === 'signin'
                ? 'Sign In'
                : 'Sign Up'}
          </button>
        </form>

        {error ? (
          <p className="mt-4 text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="text-gray-400 underline-offset-2 hover:text-gray-300 hover:underline"
          >
            Continue as guest
          </Link>
        </p>
      </div>
    </div>
  )
}
