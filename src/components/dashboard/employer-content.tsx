"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Eye, Plus, ArrowRight, User, Mail, Phone, Calendar, Clock, CheckCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EmployerDashboardContent() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0, // Mock for now or fetch if API exists
        totalViews: 0
    })
    const [recentJobs, setRecentJobs] = useState<any[]>([])
    const [recentApplications, setRecentApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const [selectedApp, setSelectedApp] = useState<any | null>(null)
    const [viewingJob, setViewingJob] = useState<any | null>(null)
    const [jobApplicants, setJobApplicants] = useState<any[]>([])
    const [cvUrl, setCvUrl] = useState<string | null>(null)
    const [cvLoading, setCvLoading] = useState(false)
    const [appsLoading, setAppsLoading] = useState(false)

    const formatDate = (date: any) => {
        if (!date) return "N/A"
        const d = new Date(date)
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("vi-VN")
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return

            try {
                setLoading(true)
                // Fetch jobs created by this employer
                const jobsRes = await fetch(`/api/jobs?creatorId=${user._id}`)
                const jobsData = await jobsRes.json()

                // Fetch applications for this employer
                const appsRes = await fetch(`/api/applications?role=employer&employerId=${user._id}`)
                const appsData = await appsRes.json()
                const applications = appsData.success && Array.isArray(appsData.data) ? appsData.data : []
                const realApplicationCount = applications.length

                if (jobsData.success) {
                    const jobs = jobsData.data.jobs || []

                    // Calculate applicant count per job from applications data
                    const applicantCountPerJob: Record<string, number> = {}
                    applications.forEach((app: any) => {
                        const jobId = app.jobId?.toString() || ''
                        applicantCountPerJob[jobId] = (applicantCountPerJob[jobId] || 0) + 1
                    })

                    // Attach real applicant count to each job
                    const jobsWithCounts = jobs.map((job: any) => ({
                        ...job,
                        applicants: applicantCountPerJob[job._id?.toString()] || 0
                    }))

                    // Calculate stats
                    const active = jobs.filter((j: any) => j.status === 'active').length
                    const pending = jobs.filter((j: any) => j.status === 'pending').length
                    const views = jobs.reduce((acc: number, j: any) => acc + (j.views || 0), 0)
                    // Use real count from applications API

                    setStats({
                        activeJobs: active,
                        pendingJobs: pending,
                        totalApplications: realApplicationCount,
                        totalViews: views
                    })

                    setRecentJobs(jobsWithCounts.slice(0, 5)) // Get top 5 recent with real counts
                    setRecentApplications(applications.slice(0, 5)) // Show top 5 latest
                }
            } catch (error) {
                console.error("Failed to fetch employer dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?._id])

    const handleStatusChange = async (appId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    updaterId: user?.id || user?._id,
                    updaterRole: 'employer'
                })
            })
            if (res.ok) {
                setRecentApplications(prev =>
                    prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
                )

                setJobApplicants(prev =>
                    prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
                )

                toast({
                    title: "Thành công",
                    description: "Đã cập nhật trạng thái ứng tuyển",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật trạng thái",
                variant: "destructive"
            })
        }
    }

    const base64ToBlobUrl = (base64String: string) => {
        try {
            const [meta, content] = base64String.split(",")

            if (!content) return null

            const mime = meta.match(/data:(.*?);base64/)?.[1] || "application/pdf"
            const byteCharacters = atob(content)
            const byteNumbers = new Array(byteCharacters.length)

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }

            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: mime })

            return URL.createObjectURL(blob)
        } catch (e) {
            console.error("Base64 error:", e)
            return null
        }
    }

    const handleViewDetails = async (app: any) => {
        setSelectedApp(app)
        setCvUrl(null)
        setCvLoading(true)

        if (app.status === 'pending') {
            handleStatusChange(app._id, 'reviewed')
        }

        try {
            const res = await fetch(`/api/applications/${app._id}`)
            const data = await res.json()

            if (!data.success) return

            const cvBase64 = data.data?.cvBase64
            const cvUrlFromApi = data.data?.cvUrl

            // ✅ CASE 1: base64
            if (cvBase64) {
                const blobUrl = base64ToBlobUrl(cvBase64)
                if (blobUrl) setCvUrl(blobUrl)
            }
            // ✅ CASE 2: url
            else if (cvUrlFromApi) {
                setCvUrl(cvUrlFromApi)
            }
            // ❌ CASE 3: không có
            else {
                setCvUrl(null)
            }

        } catch (error) {
            console.error("Error loading CV", error)
            setCvUrl(null)
        } finally {
            setCvLoading(false)
        }
    }

    const handleViewJobApplicants = async (job: any) => {
        setViewingJob(job)
        setAppsLoading(true)
        setJobApplicants([])

        try {
            const res = await fetch(`/api/applications?jobId=${job._id}&employerId=${user?._id}&role=employer`)
            const data = await res.json()
            if (data.success) {
                setJobApplicants(data.data)
            }
        } catch (error) {
            console.error("Error fetching job applicants", error)
        } finally {
            setAppsLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending": return <Badge className="bg-blue-100 text-blue-700">Mới</Badge>
            case "reviewed": return <Badge className="bg-yellow-100 text-yellow-700">Đã xem</Badge>
            case "interviewed": return <Badge className="bg-purple-100 text-purple-700">Phỏng vấn</Badge>
            case "hired": return <Badge className="bg-green-100 text-green-700">Đã tuyển</Badge>
            case "rejected": return <Badge className="bg-red-100 text-red-700">Từ chối</Badge>
            default: return <Badge variant="outline">Chưa rõ</Badge>
        }
    }

    if (loading) {
        return <div className="text-center py-8">Đang tải dữ liệu...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tin đang đăng</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            + {stats.pendingJobs} tin đang chờ duyệt
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn ứng tuyển</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số CV đã nhận
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt xem tin</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng lượt xem tất cả tin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ứng viên tiềm năng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Tính năng đang phát triển
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Banner */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div>
                    <h3 className="text-lg font-semibold text-primary">Đăng tin tuyển dụng mới?</h3>
                    <p className="text-sm text-muted-foreground">Tiếp cận hàng nghìn sinh viên tiềm năng ngay hôm nay.</p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Đăng tin ngay
                    </Button>
                </Link>
            </div>

            {/* Recent Jobs List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tin tuyển dụng gần đây</CardTitle>
                    <Link href="/dashboard/my-jobs">
                        <Button variant="ghost" size="sm" className="text-primary">Xem tất cả <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentJobs.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">Chưa có bài đăng nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {recentJobs.map((job) => (
                                <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1 min-w-0 flex-1 cursor-pointer" onClick={() => handleViewJobApplicants(job)}>
                                        <h4 className="font-semibold text-primary hover:underline truncate">{job.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Đăng: {new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
                                            <span>•</span>
                                            <span className="font-medium text-blue-600">{job.applicants || 0} hồ sơ</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {(() => {
                                            const today = new Date()
                                            today.setHours(0, 0, 0, 0)

                                            const parseDateLocal = (dateVal: any) => {
                                                if (!dateVal) return new Date(0)
                                                if (dateVal instanceof Date) return dateVal
                                                if (typeof dateVal === 'string' && dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                                                    const [day, month, year] = dateVal.split('/').map(Number)
                                                    return new Date(year, month - 1, day)
                                                }
                                                return new Date(dateVal)
                                            }

                                            const isExpired = job.status === 'active' && job.deadline && job.deadline !== "Vô thời hạn" && parseDateLocal(job.deadline) < today

                                            if (isExpired) {
                                                return <Badge variant="destructive">Hết hạn</Badge>
                                            }

                                            return (
                                                <Badge variant={job.status === 'active' ? 'default' : job.status === 'pending' ? 'secondary' : 'destructive'}>
                                                    {job.status === 'active' ? 'Đang hiển thị' : job.status === 'pending' ? 'Chờ duyệt' : 'Đã đóng/Từ chối'}
                                                </Badge>
                                            )
                                        })()}
                                        <div className="flex items-center gap-2">
                                            <Link href={`/jobs/${job._id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="outline" size="sm" className="h-8">Xem</Button>
                                            </Link>
                                            <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); handleViewJobApplicants(job); }}>Ứng viên</Button>
                                            <Link href={`/dashboard/jobs/${job._id}/edit`} onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-8">Sửa</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Applications List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Hồ sơ ứng tuyển mới nhất</CardTitle>
                    <Link href="/dashboard/applicants-manager">
                        <Button variant="ghost" size="sm" className="text-primary">Quản lý tất cả <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentApplications.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">Chưa có hồ sơ mới nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {recentApplications.map((app) => (
                                <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="font-semibold truncate">{app.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-medium text-blue-600 truncate">{app.job?.title}</span>
                                                <span>•</span>
                                                <span>{formatDate(app.appliedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={app.status}
                                            onValueChange={(val) => handleStatusChange(app._id, val)}
                                        >
                                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                                <SelectValue>{getStatusBadge(app.status)}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Mới</SelectItem>
                                                <SelectItem value="reviewed">Đã xem</SelectItem>
                                                <SelectItem value="interviewed">Mời PV</SelectItem>
                                                <SelectItem value="hired">Đã tuyển</SelectItem>
                                                <SelectItem value="rejected">Từ chối</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>Chi tiết</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Application Detail Dialog */}
            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span>Chi tiết ứng viên: {selectedApp?.name}</span>
                                <Badge variant="outline" className="w-fit">{selectedApp?.job?.title}</Badge>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 flex-1 min-h-0 overflow-hidden">
                        <div className="md:col-span-1 space-y-4 overflow-y-auto pr-2">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin liên hệ</h4>
                                <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-md">
                                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {selectedApp?.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedApp?.phone}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lời nhắn</h4>
                                <div className="text-sm bg-blue-50/50 p-3 rounded-md italic text-gray-700">
                                    {selectedApp?.message || "Không có lời nhắn."}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trạng thái hiện tại</h4>
                                <div className="flex items-center gap-2">
                                    {selectedApp && getStatusBadge(selectedApp.status)}
                                    <span className="text-xs text-muted-foreground">Nộp ngày: {selectedApp && new Date(selectedApp.appliedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-gray-100 rounded-md overflow-hidden relative">
                            {cvLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : cvUrl ? (
                                <iframe src={cvUrl} className="w-full h-full" title="CV Preview" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <FileText className="h-10 w-10 text-gray-300" />
                                    <span>Không thể hiển thị CV</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Job Applicants List Dialog */}
            <Dialog open={!!viewingJob} onOpenChange={(open) => !open && setViewingJob(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle>
                            Danh sách ứng viên: {viewingJob?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pt-4">
                        {appsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Clock className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : jobApplicants.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Chưa có ứng viên nào nộp vào vị trí này.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {jobApplicants.map((app) => (
                                    <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{app.name}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(app.appliedAt).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={app.status}
                                                onValueChange={(val) => handleStatusChange(app._id, val)}
                                            >
                                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                                    <SelectValue>{getStatusBadge(app.status)}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Mới</SelectItem>
                                                    <SelectItem value="reviewed">Đã xem</SelectItem>
                                                    <SelectItem value="interviewed">Mời PV</SelectItem>
                                                    <SelectItem value="hired">Đã tuyển</SelectItem>
                                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => handleViewDetails(app)}>Xem CV</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
