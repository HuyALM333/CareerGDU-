"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Clock, DollarSign, Building, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import { JobPreviewPanel } from "@/components/jobs/job-preview-panel"
import { getFeaturedJobs, Job } from "@/lib/jobs-data"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

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

interface FeaturedJobsProps {
  initialJobs?: Job[]
  initialConfig?: any
}

export function FeaturedJobs({ initialJobs, initialConfig }: FeaturedJobsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string; jobId: string; creatorId?: string; companyEmail?: string; companyPhone?: string; companyWebsite?: string; jobType?: string; deadline?: string } | null>(null)
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>(initialJobs || getFeaturedJobs(4))
  const [loading, setLoading] = useState(!initialJobs)
  const [config, setConfig] = useState<any>(initialConfig || null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Effect to handle loading state if no initial data
  useEffect(() => {
    if (initialJobs && initialConfig) {
      setLoading(false)
    }
  }, [initialJobs, initialConfig])

  const handleApply = (jobId: string, jobTitle: string, company: string, creatorId?: string, email?: string, phone?: string, website?: string, jobType?: string, deadline?: string) => {
    if (!user) {
      router.push("/login?redirect=/")
      return
    }
    setSelectedJob({
      title: jobTitle,
      company: company,
      jobId: jobId,
      creatorId: creatorId,
      companyEmail: email,
      companyPhone: phone,
      companyWebsite: website,
      jobType: jobType,
      deadline: deadline
    })
    setIsApplyDialogOpen(true)
  }

  // Robust date parsing helper
  const parseDateHelper = (dateVal: any): number => {
    if (!dateVal) return 0
    try {
      if (dateVal instanceof Date) return dateVal.getTime()
      if (typeof dateVal === 'string') {
        if (dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateVal.split('/').map(Number)
          return new Date(year, month - 1, day).getTime()
        }
        const date = new Date(dateVal)
        return isNaN(date.getTime()) ? 0 : date.getTime()
      }
      const date = new Date(dateVal)
      return isNaN(date.getTime()) ? 0 : date.getTime()
    } catch {
      return 0
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-accent/30 via-muted/40 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {config?.title || "Việc làm nổi bật"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {config?.description || "Cơ hội việc làm hấp dẫn dành cho sinh viên GDU"}
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="hidden md:flex items-center gap-2 bg-card hover:bg-accent">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredJobs.map((job) => (
            <Card
              key={job._id}
              className={`hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm border-border/50 h-full flex flex-col ${hoveredJob?._id === job._id ? 'z-50 relative' : 'relative'}`}
            >
              <CardContent className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={job.logo || "/placeholder.svg"}
                      alt={job.company}
                      className={`w-full h-full ${job.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className={typeColors[job.type as keyof typeof typeColors]}>
                      {typeLabels[job.type as keyof typeof typeLabels]}
                    </Badge>
                  </div>
                </div>

                <div
                  className="relative inline-block w-full"
                  onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    setHoveredJob(job)
                  }}
                  onMouseLeave={() => {
                    timeoutRef.current = setTimeout(() => {
                      setHoveredJob(null)
                    }, 300)
                  }}
                >
                  <Link href={`/jobs/${job._id}`} className="group-hover:text-primary transition-colors block">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                  </Link>

                  {/* Quick View Popover */}
                  {hoveredJob?._id === job._id && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-[350px] shadow-xl rounded-lg border border-gray-200 bg-white animate-in fade-in zoom-in-95 duration-200">
                      <JobPreviewPanel
                        job={hoveredJob}
                        onApply={(job) => handleApply(job._id, job.title, job.company, job.creatorId, job.contactEmail, job.contactPhone, job.website, job.type, job.deadline)}
                        onSave={() => { }}
                        isSaved={false}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-foreground">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>{job.deadline ? `Hạn: ${job.deadline}` : "Vô thời hạn"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                {(() => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const jobAny = job as any
                  const expiredAtMs = parseDateHelper(jobAny.expiredAt)
                  const deadlineMs = parseDateHelper(job.deadline)

                  const normalizeDay = (ms: number) => {
                    if (ms <= 0) return 0
                    const d = new Date(ms)
                    d.setHours(0, 0, 0, 0)
                    return d.getTime()
                  }

                  const isExpired = (normalizeDay(expiredAtMs) > 0 && normalizeDay(expiredAtMs) < today.getTime())
                    || (normalizeDay(deadlineMs) > 0 && normalizeDay(deadlineMs) < today.getTime())

                  const quantity = jobAny.quantity
                  const hiredCount = jobAny.hiredCount || 0
                  const isFull = quantity !== undefined && quantity !== -1 && hiredCount >= (quantity || 1)

                  if (isFull) {
                    return (
                      <div className="w-full h-11 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-100 rounded-md">
                        Đã tuyển đủ
                      </div>
                    )
                  }

                  return (
                    <Button
                      className={`w-full ${(user?.role === "employer" || user?.role === "admin" || isExpired) ? "bg-gray-100 text-gray-400 hover:bg-gray-100" : "bg-primary hover:bg-primary/90"}`}
                      onClick={() => {
                        if (user?.role === "employer" || user?.role === "admin") return
                        handleApply(job._id, job.title, job.company, job.creatorId, job.contactEmail, job.contactPhone, job.website, job.type, job.deadline)
                      }}
                      disabled={user?.role === "employer" || user?.role === "admin" || isExpired}
                    >
                      {isExpired
                        ? "Hết hạn"
                        : (user?.role === "employer" || user?.role === "admin") ? "Chỉ dành cho ứng viên" : "Ứng tuyển ngay"}
                    </Button>
                  )
                })()}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/jobs">
            <Button variant="outline" className="items-center gap-2 bg-card hover:bg-accent">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <ApplyJobDialog
        isOpen={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        jobTitle={selectedJob?.title || ""}
        companyName={selectedJob?.company || ""}
        jobId={selectedJob?.jobId}
        companyEmail={selectedJob?.companyEmail}
        companyPhone={selectedJob?.companyPhone}
        companyWebsite={selectedJob?.companyWebsite}
        jobType={selectedJob?.jobType}
        deadline={selectedJob?.deadline}
      />
    </section>
  )
}
