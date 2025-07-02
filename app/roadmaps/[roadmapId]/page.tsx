"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { apiClient } from "@/lib/api"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RoadmapCoordinate } from "@/components/roadmap-map"

const RoadmapMap = dynamic(() => import("@/components/roadmap-map").then((m) => m.RoadmapMap), {
  ssr: false,
})

interface RoadmapItem {
  id: number
  title: string
  description?: string
  order_index: number
  coordinates?: RoadmapCoordinate | null
}

interface TravelRoadmap {
  id: number
  title: string
  description?: string
  roadmap_items: RoadmapItem[]
  start_date?: string
  end_date?: string
}

export default function RoadmapDetailPage() {
  const params = useParams<{ roadmapId: string }>()
  const router = useRouter()
  const roadmapId = params.roadmapId ? parseInt(params.roadmapId) : null

  const [roadmap, setRoadmap] = useState<TravelRoadmap | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roadmapId) return
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getRoadmapById(roadmapId)
      if (error) setError(error)
      if (data) setRoadmap(data as any)
      setLoading(false)
    }
    fetchData()
  }, [roadmapId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">{error || "Roadmap not found"}</p>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  // Gather coordinates for map in order
  const coords: RoadmapCoordinate[] = roadmap.roadmap_items
    .filter((i) => i.coordinates)
    .map((i) => ({
      ...i.coordinates!,
      place_name: i.title,
      order_index: i.order_index,
    }))

  const itemsSorted = [...roadmap.roadmap_items].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center space-x-1">
        <ArrowLeft className="h-4 w-4" /> <span>Back</span>
      </Button>

      <h1 className="text-3xl font-bold">{roadmap.title}</h1>
      {roadmap.description && <p className="text-slate-600 mb-4">{roadmap.description}</p>}

      <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* @ts-ignore */}
        <RoadmapMap coordinates={coords} />
      </div>

      {/* Timeline list */}
      <div className="space-y-4">
        {itemsSorted.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                {item.order_index}. {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.description ? (
                <p className="text-sm text-slate-600">{item.description}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">No description</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 