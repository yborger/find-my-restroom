'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error)
  }
  void reset

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <h2 className="text-xl font-semibold text-white md:text-2xl">
        Something went wrong
      </h2>
      <p className="mt-3 max-w-md text-sm text-[#888]">
        Try refreshing the page.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 rounded-lg border-2 border-[#f0b429] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#f0b429] transition hover:bg-[#f0b429]/10"
      >
        Refresh
      </button>
    </div>
  )
}
