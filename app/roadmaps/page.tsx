"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface TravelRoadmap {
  id: number
  title: string
  start_date?: string
  end_date?: string
}

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<TravelRoadmap[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getUserRoadmaps()
      if (error) setError(error)
      if (data) setRoadmaps(data as any)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Roadmaps</h1>
      {roadmaps && roadmaps.length === 0 && <p>No roadmaps found.</p>}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {roadmaps?.map((rm) => (
          <Link key={rm.id} href={`/roadmaps/${rm.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{rm.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {rm.start_date || "?"} – {rm.end_date || "?"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 