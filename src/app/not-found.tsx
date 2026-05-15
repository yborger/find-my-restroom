import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <p className="text-6xl" aria-hidden>
        🚽
      </p>
      <h1 className="mt-6 text-2xl font-semibold text-white md:text-3xl">
        404 — This throne doesn&apos;t exist
      </h1>
      <p className="mt-3 text-[#888]">Nothing to see here.</p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-[#f0b429] underline-offset-4 hover:underline"
      >
        ← Back to the map
      </Link>
    </div>
  )
}
