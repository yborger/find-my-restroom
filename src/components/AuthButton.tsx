'use client'

import dynamic from 'next/dynamic'

export const AuthButton = dynamic(
  () => import('./auth-button-inner').then((m) => m.AuthButtonInner),
  { ssr: false, loading: () => null },
)
