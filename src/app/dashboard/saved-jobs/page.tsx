"use client"

import { useState, useEffect } from "react"
import { Bookmark, MapPin, Clock, DollarSign, Building, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyTitle, EmptyDescription, EmptyAction } from "@/components/ui/empty"
import Link from "next/link"

import { useAuth } from "@/lib/auth-context"

interface SavedJob {
  id: string
  title: string
  company: string
  logo: string
  location: string
  type: string
  salary: string
  deadline: string
  savedAt: string
}

const typeColors = {
  "full-time": "bg-green-500/20 text-green-700 border border-green-500/30",
  "part-time": "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  internship: "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  freelance: "bg-purple-500/20 text-purple-700 border border-purple-500/30",
}

const typeLabels = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  internship: "Thực tập",
  freelance: "Freelance",
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      fetchSavedJobs()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const fetchSavedJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/saved-jobs?userId=${user?.id}`)
      const result = await response.json()

      if (result.success) {
        // Map database records to SavedJob interface
        const mappedJobs = result.data.map((record: any) => ({
          id: record.jobId,
          ...record.jobData,
          savedAt: new Date(record.savedAt).toLocaleDateString("vi-VN")
        }))
        setSavedJobs(mappedJobs)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch saved jobs:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách việc làm đã lưu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (jobId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/saved-jobs?userId=${user.id}&jobId=${jobId}`, { method: "DELETE" })
      const result = await response.json()

      if (result.success) {
        setSavedJobs(savedJobs.filter((job) => job.id !== jobId))
        toast({
          title: "Đã xóa",
          description: "Đã xóa việc làm khỏi danh sách lưu",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa việc làm",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Việc làm đã lưu</h1>
          <p className="text-muted-foreground mt-1">Danh sách các vị trí bạn đã lưu</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-14 w-14 rounded-lg mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Việc làm đã lưu</h1>
          <p className="text-muted-foreground mt-1">
            Bạn đã lưu <span className="font-semibold text-foreground">{savedJobs.length}</span> vị trí việc làm
          </p>
        </div>
        <Link href="/jobs">
          <Button variant="outline">
            <Bookmark className="h-4 w-4 mr-2" />
            Tìm thêm việc làm
          </Button>
        </Link>
      </div>

      {savedJobs.length === 0 ? (
        <Card className="p-12">
          <Empty>
            <Bookmark className="h-12 w-12" />
            <EmptyTitle>Chưa có việc làm nào được lưu</EmptyTitle>
            <EmptyDescription>Hãy khám phá các cơ hội việc làm và lưu những vị trí bạn quan tâm</EmptyDescription>
            <EmptyAction>
              <Link href="/jobs">
                <Button>Khám phá việc làm</Button>
              </Link>
            </EmptyAction>
          </Empty>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={job.logo || "/placeholder.svg"}
                    alt={job.company}
                    className="w-14 h-14 rounded-lg object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <Badge className={typeColors[job.type as keyof typeof typeColors]}>
                      {typeLabels[job.type as keyof typeof typeLabels]}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Đã lưu: {job.savedAt}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{job.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-foreground">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>Hạn: {job.deadline}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex gap-2">
                <Button className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ứng tuyển
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleRemove(job.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
