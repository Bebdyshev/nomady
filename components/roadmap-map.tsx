"use client"

import React, { useMemo, useState, useEffect } from "react"
import Map, { Marker, Source, Layer } from "react-map-gl"
import { Coordinate } from "@/types/coordinate"
import { useTheme } from "next-themes"

interface RoadmapMapProps {
  coordinates: Coordinate[]
  className?: string
}

// Simple in-component numbered pin
const Pin = ({ number }: { number: number }) => (
  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
    {number}
  </div>
)

export function RoadmapMap({ coordinates, className }: RoadmapMapProps) {
  const { theme } = useTheme()
  const [initialView, setInitialView] = useState({ longitude: 0, latitude: 0, zoom: 2 })

  // Compute center
  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return
    let sumLat = 0
    let sumLng = 0
    coordinates.forEach((c) => {
      sumLat += c.latitude
      sumLng += c.longitude
    })
    setInitialView({
      longitude: sumLng / coordinates.length,
      latitude: sumLat / coordinates.length,
      zoom: coordinates.length === 1 ? 9 : 4,
    })
  }, [coordinates])

  // GeoJSON for polyline
  const lineGeoJson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
          },
        },
      ],
    }
  }, [coordinates])

  return (
    <div className={`w-full h-full ${className || ""}`.trim()}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={initialView}
        style={{ width: "100%", height: "100%" }}
        mapStyle={`mapbox://styles/mapbox/${theme === "dark" ? "dark" : "light"}-v11`}
      >
        {coordinates.length > 1 && (
          <Source id="route" type="geojson" data={lineGeoJson}>
            <Layer
              id="route-line"
              type="line"
              paint={{ "line-color": "#2563eb", "line-width": 4, "line-opacity": 0.8 }}
            />
          </Source>
        )}

        {coordinates.map((coord, idx) => (
          <Marker key={coord.id} longitude={coord.longitude} latitude={coord.latitude} anchor="bottom">
            <Pin number={idx + 1} />
          </Marker>
        ))}
      </Map>
    </div>
  )
} 