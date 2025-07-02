"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L, { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default icon path so markers appear correctly in Next.js bundler
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"

// Configure the default icon only once
const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export interface RoadmapCoordinate {
  id?: number
  place_name?: string
  latitude: number
  longitude: number
  order_index?: number
}

interface RoadmapMapProps {
  coordinates: RoadmapCoordinate[]
}

function FitBounds({ coords }: { coords: RoadmapCoordinate[] }) {
  const map = useMap()
  useEffect(() => {
    if (!coords || coords.length === 0) return
    const bounds = L.latLngBounds(
      coords.map((c) => [c.latitude, c.longitude] as LatLngExpression),
    )
    map.fitBounds(bounds, { padding: [20, 20] })
  }, [coords, map])
  return null
}

export function RoadmapMap({ coordinates }: RoadmapMapProps) {
  // Fallback center if no coords yet
  const first = coordinates[0]
  const center: LatLngExpression = first ? [first.latitude, first.longitude] : [0, 0]

  // Build polyline path in order
  const sorted = [...coordinates].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const path: LatLngExpression[] = sorted.map((c) => [c.latitude, c.longitude])

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sorted.map((coord, idx) => (
        <Marker
          key={`${coord.latitude}-${coord.longitude}-${idx}`}
          position={[coord.latitude, coord.longitude] as LatLngExpression}
        >
          <Popup>
            {idx + 1}. {coord.place_name || "Destination"}
          </Popup>
        </Marker>
      ))}

      {path.length > 1 && <Polyline positions={path} color="blue" />}

      <FitBounds coords={coordinates} />
    </MapContainer>
  )
} 