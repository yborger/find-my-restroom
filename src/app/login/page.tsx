'use client'

import dynamic from 'next/dynamic'

const LoginForm = dynamic(
  () => import('./login-form').then((m) => m.LoginForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-gray-500">
        Loading…
      </div>
    ),
  },
)

export default function LoginPage() {
  return <LoginForm />
}
