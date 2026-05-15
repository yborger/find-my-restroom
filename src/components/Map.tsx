'use client'

import type { Restroom } from '@/types/database'
import L from 'leaflet'
import { useEffect } from 'react'
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'

export interface MapProps {
  restrooms: Restroom[]
  onRestroomClick: (r: Restroom) => void
  selectedId: string | null
  recommendedIds: string[]
  userLat: number
  userLng: number
}

function MapTileFilter() {
  const mapInstance = useMap()

  useEffect(() => {
    const tiles = document.querySelector('.leaflet-tile-pane') as HTMLElement | null
    if (tiles) {
      tiles.style.filter =
        'brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7)'
    }
  }, [mapInstance])

  return null
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])

  return null
}

function markerFillColor(avg: number | null): string {
  if (avg === null) return '#6b7280'
  if (avg >= 4) return '#22c55e'
  if (avg >= 3) return '#eab308'
  return '#ef4444'
}

export default function Map({
  restrooms,
  onRestroomClick,
  selectedId,
  recommendedIds,
  userLat,
  userLng,
}: MapProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Leaflet default icon patch
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <div className="h-full w-full" style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={[userLat, userLng]}
        zoom={14}
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapTileFilter />
        <MapRecenter lat={userLat} lng={userLng} />
        {restrooms.map((restroom) => {
          const isSelected = restroom.id === selectedId
          const isRecommended = recommendedIds.includes(restroom.id)
          const radius = isSelected || isRecommended ? 13 : 8
          const color = isSelected ? 'white' : isRecommended ? '#f0b429' : 'white'
          const weight = isSelected || isRecommended ? 3 : 1.5
          const fillColor = markerFillColor(restroom.avg_cleanliness)

          return (
            <CircleMarker
              key={restroom.id}
              center={[restroom.lat, restroom.lng]}
              radius={radius}
              pathOptions={{
                color,
                weight,
                fillColor,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onRestroomClick(restroom),
              }}
            >
              <Tooltip permanent={false} direction="top">
                {restroom.name}
              </Tooltip>
            </CircleMarker>
          )
        })}
        <CircleMarker
          center={[userLat, userLng]}
          radius={8}
          pathOptions={{
            color: 'white',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 1,
          }}
        >
          <Tooltip permanent={false} direction="top">
            You are here
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
