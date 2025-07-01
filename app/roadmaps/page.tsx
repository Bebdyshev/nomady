"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Roadmap {
  id: number
  title: string
  description?: string
  start_date?: string
  end_date?: string
}

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoadmaps = async () => {
      const { data, error } = await apiClient.getUserRoadmaps()
      if (data) setRoadmaps(data as any)
      if (error) console.error(error)
      setLoading(false)
    }
    fetchRoadmaps()
  }, [])

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Your Roadmaps</h1>
      {roadmaps.length === 0 && <p>No roadmaps found.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((rm) => (
          <Card key={rm.id}>
            <CardHeader>
              <CardTitle>{rm.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rm.description && <p className="text-sm text-slate-600">{rm.description}</p>}
              <p className="text-xs text-slate-500">
                {rm.start_date} — {rm.end_date}
              </p>
              <Link href={`/roadmaps/${rm.id}`}>
                <Button size="sm" className="mt-2">
                  View
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 