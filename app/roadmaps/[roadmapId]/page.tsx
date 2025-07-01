"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api"
import { RoadmapMap } from "@/components/roadmap-map"
import { Coordinate } from "@/types/coordinate"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RoadmapDetailPage() {
  const params = useParams<{ roadmapId: string }>()
  const roadmapId = parseInt(params.roadmapId, 10)

  const [roadmap, setRoadmap] = useState<any>(null)
  const [coordinates, setCoordinates] = useState<Coordinate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roadmapId) return
    const fetchData = async () => {
      const [rmRes, coordRes] = await Promise.all([
        apiClient.getRoadmapById(roadmapId),
        apiClient.getRoadmapCoordinates(roadmapId),
      ])
      if (rmRes.data) setRoadmap(rmRes.data)
      if (coordRes.data) setCoordinates(coordRes.data as any)
      setLoading(false)
    }
    fetchData()
  }, [roadmapId])

  if (loading) return <p className="p-4">Loading...</p>
  if (!roadmap) return <p className="p-4">Roadmap not found.</p>

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold">{roadmap.title}</h1>
        {roadmap.description && <p className="text-slate-600 dark:text-slate-300">{roadmap.description}</p>}
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <span>{roadmap.start_date}</span>
          <span>–</span>
          <span>{roadmap.end_date}</span>
          {roadmap.ai_generated && <Badge variant="secondary">AI generated</Badge>}
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-[60vh] max-w-6xl mx-auto">
        <RoadmapMap coordinates={coordinates} />
      </div>

      {/* Stops list */}
      {roadmap.roadmap_items && (
        <div className="max-w-3xl mx-auto space-y-4">
          {roadmap.roadmap_items.map((item: any, idx: number) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-blue-600">{idx + 1}.</span>
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {item.description && <p>{item.description}</p>}
                {item.start_datetime && (
                  <p>
                    {new Date(item.start_datetime).toLocaleString()} – {new Date(item.end_datetime).toLocaleString()}
                  </p>
                )}
                {item.coordinates && (
                  <p>
                    {item.coordinates.city}, {item.coordinates.country}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 