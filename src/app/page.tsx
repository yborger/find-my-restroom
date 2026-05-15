'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }} />
  ),
})

export default function Home() {
  return (
    <div
      className="fixed inset-0"
      style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}
    >
      <div className="h-full w-full">
        <Map
          restrooms={[]}
          onRestroomClick={() => {}}
          selectedId={null}
          recommendedIds={[]}
          userLat={44.9778}
          userLng={-93.265}
        />
      </div>
    </div>
  )
}
