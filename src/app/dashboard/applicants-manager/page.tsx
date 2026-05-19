"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { FileText, Mail, Phone, Calendar, User, CheckCircle, XCircle, Clock, Eye, Search, Filter, RotateCcw, Maximize2, Minimize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Application {
    id: string

    name: string
    email: string
    phone: string

    status: "pending" | "reviewed" | "interviewed" | "rejected" | "hired"
    appliedAt: string

    job?: {
        title?: string
        creatorId?: string
    }

    company?: {
        name?: string
    }

    cvUrl?: string
    cvBase64?: string
    cvOriginalName?: string

    studentId?: string
    major?: string
    faculty?: string
    cohort?: string

    coverLetter?: string
}

import { Suspense } from "react"

export const dynamic = "force-dynamic"

const base64ToBlobUrl = (base64String: string) => {
    try {
        const [meta, content] = base64String.split(",")

        if (!content) {
            throw new Error("Base64 không hợp lệ")
        }

        const mime = meta.match(/data:(.*?);base64/)?.[1] || "application/pdf"
        const byteCharacters = atob(content)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mime })

        return URL.createObjectURL(blob)
    } catch (error) {
        console.error("Lỗi convert base64 sang Blob URL:", error)
        return null
    }
}

function ManageApplicationsContent() {
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const currentUserId = user?.id || user?._id
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)
    const [cvLoading, setCvLoading] = useState(false)
    const [cvUrl, setCvUrl] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"cv" | "details">("details")
    const [isExpanded, setIsExpanded] = useState(false)

    // Filter states
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [jobFilter, setJobFilter] = useState("all")
    const [companyFilter, setCompanyFilter] = useState("all")

    // Filtered data logic
    const safe = (v?: string) => (v || "").toLowerCase()

    const formatDate = (d?: string) => {
        if (!d) return "N/A"
        const date = new Date(d)
        return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN")
    }

    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            safe(app.name).includes(safe(searchTerm)) ||
            safe(app.job?.title || (app as any).job?.title).includes(safe(searchTerm)) ||
            safe(app.email).includes(safe(searchTerm))

        const matchesStatus = statusFilter === "all" || app.status === statusFilter
        const matchesJob = jobFilter === "all" || app.job?.title === jobFilter
        const matchesCompany =
            user?.role !== "admin" ||
            companyFilter === "all" ||
            app.company?.name === companyFilter

        return matchesSearch && matchesStatus && matchesJob && matchesCompany
    })

    // Get unique jobs and companies for filters
    const uniqueJobs = Array.from(
        new Set(applications.map(app => app.job?.title || (app as any).job?.title).filter(Boolean))
    )
    const uniqueCompanies = Array.from(
        new Set(applications.map(app => app.company?.name))
    ).filter(Boolean) as string[]

    const [hasAutoOpened, setHasAutoOpened] = useState(false)

    useEffect(() => {
        if (!isLoading && user) {
            fetchApplications()
        }
    }, [isLoading, user])

    // Deep linking: Check for 'id' in URL and auto-open that application
    useEffect(() => {
        const idFromUrl = searchParams.get("id")

        if (!hasAutoOpened && idFromUrl && applications.length > 0) {
            const targetApp = applications.find(app => app.id === idFromUrl)

            if (targetApp) {
                setHasAutoOpened(true) // 🔥 set trước

                handleViewCV(targetApp).finally(() => {
                    router.replace("/dashboard/applicants-manager")
                })
            }
        }
    }, [searchParams, applications, hasAutoOpened])

    const fetchApplications = async () => {
        try {
            const role = user?.role || "student"
            const queryParams = new URLSearchParams()
            queryParams.set("role", role)

            if (role === "student") {
                // Students shouldn't really be here, but if they are, show nothing or their Own
                queryParams.set("email", user?.email || "")
            } else if (role === "employer") {
                queryParams.set("employerId", currentUserId || "")
            }

            console.log("Fetching applications with params:", queryParams.toString())

            // Support filtering by jobId from URL
            const jobIdFromUrl = searchParams.get("jobId")
            if (jobIdFromUrl) {
                queryParams.set("jobId", jobIdFromUrl)
            }

            const res = await fetch(`/api/applications?${queryParams.toString()}`)
            const data = await res.json()

            if (data.success) {
                setApplications(data.data)
            }
        } catch (error) {
            console.error("Error fetching applications:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewCV = async (app: Application) => {
        setSelectedApp(app)
        setViewMode("cv")
        setCvLoading(true)

        setCvUrl(null)

        if (app.status === "pending") {
            handleStatusChange(app.id, "reviewed")
        }

        try {
            const res = await fetch(`/api/applications/${app.id}`)
            const data = await res.json()

            if (!data.success) {
                throw new Error("API failed")
            }

            const cvUrl = data.data?.cvUrl
            const cvType = data.data?.cvType
            const originalName = data.data?.cvOriginalName || "CV.docx"

            // ✅ detect file type
            const isWord =
                originalName.toLowerCase().endsWith(".doc") ||
                originalName.toLowerCase().endsWith(".docx")

            if (cvUrl) {
                const fullUrl = cvUrl.startsWith("http")
                    ? cvUrl
                    : `${window.location.origin}${cvUrl}`

                // ✅ PDF → preview
                if (cvType === "application/pdf" && !isWord) {
                    setCvUrl(fullUrl)
                }
                // ✅ WORD → LUÔN DOWNLOAD (KHÔNG preview)
                else {
                    // ✅ WORD → download giống application (fetch + blob)
                    const response = await fetch(fullUrl)
                    const blob = await response.blob()

                    const blobUrl = URL.createObjectURL(blob)

                    const link = document.createElement("a")
                    link.href = blobUrl
                    link.download = originalName

                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    URL.revokeObjectURL(blobUrl)

                    // đóng modal
                    setSelectedApp(null)
                }

                return
            }

            // ❗ fallback nếu backend trả base64
            const cvBase64 = data.data?.cvBase64
            if (cvBase64) {
                const blobUrl = base64ToBlobUrl(cvBase64)

                if (blobUrl) {
                    const link = document.createElement("a")
                    link.href = blobUrl
                    link.download = originalName

                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    setSelectedApp(null)
                }
            }

        } catch (error) {
            console.error("Error fetching CV:", error)

            toast({
                title: "Lỗi",
                description: "Có lỗi khi tải CV",
                variant: "destructive"
            })
        } finally {
            setCvLoading(false)
        }
    }

    const hasCV = selectedApp?.cvBase64 || selectedApp?.cvUrl

    const handleViewDetails = (app: Application) => {
        setSelectedApp(app)
        setViewMode("details")

        // Auto-update status to "Reviewed" if currently "pending"
        if (app.status === "pending") {
            handleStatusChange(app.id, "reviewed")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mới</Badge>
            case "reviewed":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Đã xem</Badge>
            case "interviewed":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Phỏng vấn</Badge>
            case "hired":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã tuyển</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Từ chối</Badge>
            default:
                return <Badge variant="outline">Không xác định</Badge>
        }
    }

    const handleStatusChange = async (appId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    updaterId: user?.id,
                    updaterRole: user?.role
                })
            })

            if (res.ok) {
                setApplications(prev =>
                    prev.map(app => app.id === appId ? { ...app, status: newStatus as Application["status"] } : app)
                )

                const statusText: Record<string, string> = {
                    reviewed: "Đã xem",
                    interviewed: "Mời phỏng vấn",
                    hired: "Đã tuyển",
                    rejected: "Từ chối"
                }

                toast({
                    title: "Cập nhật thành công",
                    description: `Trạng thái đã chuyển thành "${statusText[newStatus] || newStatus}". Thông báo đã được gửi đến ứng viên.`,
                })
            } else {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to update status")
            }
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Không thể cập nhật trạng thái",
                variant: "destructive"
            })
        }
    }

    // Security: Only Admin and Employer can manage applications
    // If user is not logged in, redirect to login
    useEffect(() => {
        if (!isLoading && !user) {
            const returnUrl = encodeURIComponent(`/dashboard/applicants-manager?${searchParams.toString()}`)
            router.push(`/login?returnUrl=${returnUrl}`)
        }
    }, [user, isLoading, router, searchParams])

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect
    }

    if (user.role === 'student') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Card className="p-12 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold">Khu vực dành cho Nhà tuyển dụng</h2>
                        <p className="text-gray-500 mt-2">
                            Tài khoản hiện tại của bạn là <strong>Sinh viên</strong> ({user.email}).<br />
                            Vui lòng đăng xuất và đăng nhập bằng tài khoản <strong>Nhà tuyển dụng</strong> để xem hồ sơ ứng tuyển.
                        </p>
                        <Button
                            className="mt-6"
                            variant="outline"
                            onClick={() => router.push('/login')}
                        >
                            Đăng nhập tài khoản khác
                        </Button>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý ứng tuyển</h1>
                        <p className="text-muted-foreground mt-2">
                            Quản lý hồ sơ ứng viên cho các vị trí tuyển dụng
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="relative col-span-1 lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm tên ứng viên, vị trí, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Mới</SelectItem>
                            <SelectItem value="reviewed">Đã xem</SelectItem>
                            <SelectItem value="interviewed">Phỏng vấn</SelectItem>
                            <SelectItem value="hired">Đã tuyển</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={jobFilter} onValueChange={setJobFilter}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Vị trí tuyển dụng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vị trí</SelectItem>
                            {uniqueJobs.map(job => (
                                <SelectItem key={job} value={job}>{job}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {user?.role === "admin" && (
                        <div className="flex gap-2">
                            <Select value={companyFilter} onValueChange={setCompanyFilter}>
                                <SelectTrigger className="h-10 flex-1">
                                    <SelectValue placeholder="Doanh nghiệp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả doanh nghiệp</SelectItem>
                                    {uniqueCompanies.map(company => (
                                        <SelectItem key={company} value={company}>
                                            {company}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(searchTerm || statusFilter !== "all" || jobFilter !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setStatusFilter("all")
                                        setJobFilter("all")
                                        setCompanyFilter("all")
                                    }}
                                    className="h-10 w-10 shrink-0 text-red-500"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách hồ sơ ({filteredApplications.length})</CardTitle>
                        <CardDescription>
                            Danh sách ứng viên nộp hồ sơ vào các vị trí của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có ứng viên</h3>
                                <p className="text-gray-500">Chưa có ứng viên nào nộp hồ sơ vào các vị trí của bạn.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-1 sm:mx-0">
                                {/* Desktop Table View */}
                                <Table className="hidden lg:table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vị trí</TableHead>
                                            <TableHead>Ứng viên</TableHead>
                                            <TableHead>Liên hệ</TableHead>
                                            <TableHead>Ngày nộp</TableHead>
                                            <TableHead>CV</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>
                                                    <div className="font-medium text-blue-900">
                                                        {app.job?.title || (app as any).job?.title || "N/A"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{app.company?.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{app.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-3 w-3 text-gray-400" />
                                                            {app.email}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-gray-400" />
                                                            {app.phone}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(app.appliedAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                        onClick={() => handleViewCV(app)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Xem CV
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={app.status || "pending"}
                                                        onValueChange={(value) => handleStatusChange(app.id, value)}
                                                        disabled={
                                                            user?.role === "employer" &&
                                                            app.job?.creatorId !== currentUserId
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[140px] h-8">
                                                            <SelectValue>{getStatusBadge(app.status)}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                    Mới
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="reviewed">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                                    Đã xem
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="interviewed">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                                    Mời phỏng vấn
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="hired">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                    Đã tuyển
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="rejected">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                                    Từ chối
                                                                </span>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(app)} title="Xem chi tiết">
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 lg:hidden">
                                    {filteredApplications.map((app) => (
                                        <div key={app.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-blue-900 truncate pr-2">{app.job?.title}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{app.company?.name}</p>
                                                </div>
                                                {getStatusBadge(app.status)}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm py-3 border-y border-gray-50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ứng viên</p>
                                                    <p className="font-semibold text-gray-900 truncate">{app.name}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày nộp</p>
                                                    <p className="font-medium text-gray-700">{formatDate(app.appliedAt)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate">{app.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>{app.phone}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 font-bold text-blue-600 border-blue-100 bg-blue-50/50"
                                                    onClick={() => handleViewDetails(app)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </Button>
                                                <Select
                                                    value={app.status || "pending"}
                                                    onValueChange={(value) => handleStatusChange(app.id, value)}
                                                    disabled={
                                                        user?.role === "employer" &&
                                                        app.job?.creatorId !== currentUserId
                                                    }
                                                >
                                                    <SelectTrigger className="flex-1 h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Mới</SelectItem>
                                                        <SelectItem value="reviewed">Đã xem</SelectItem>
                                                        <SelectItem value="interviewed">Mời PV</SelectItem>
                                                        <SelectItem value="hired">Đã tuyển</SelectItem>
                                                        <SelectItem value="rejected">Từ chối</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Dialog
                open={!!selectedApp}
                onOpenChange={(open) => {
                    if (!open) {
                        if (cvUrl?.startsWith("blob:")) {
                            URL.revokeObjectURL(cvUrl)
                        }
                        setCvUrl(null)
                        setSelectedApp(null)
                        setIsExpanded(false)
                        setViewMode("details")
                    }
                }}
            >
                <DialogContent className={`${isExpanded ? 'max-w-[98vw] h-[98vh] w-[98vw]' : (viewMode === 'cv' ? 'max-w-4xl h-[90vh]' : 'max-w-2xl max-h-[85vh]')} flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-xl overflow-y-auto duration-300`}>
                    <DialogHeader>
                        <DialogTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-2">
                            <span className="text-base sm:text-lg">
                                {viewMode === 'cv' ? "Xem CV: " : "Chi tiết hồ sơ: "} {selectedApp?.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="hidden sm:inline-flex">{selectedApp?.job?.title}</Badge>
                                {viewMode === 'cv' ? (
                                    <Button variant="outline" size="sm" onClick={() => selectedApp && handleViewCV(selectedApp)} className="h-8">
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Tải lại
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => selectedApp && handleViewCV(selectedApp)} className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Xem CV
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="h-8 w-8 p-0"
                                    title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                                >
                                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {viewMode === 'cv' ? (
                        <div className="flex-1 bg-gray-100 rounded-md overflow-hidden relative min-h-[500px]">
                            {cvLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : !hasCV ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <FileText className="h-10 w-10 text-gray-300" />
                                    <span>Ứng viên chưa nộp CV</span>
                                </div>
                            ) : cvUrl ? (
                                <iframe src={cvUrl} className="w-full h-full" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col gap-2">
                                    <FileText className="h-10 w-10 text-gray-300" />
                                    <span>Không thể hiển thị CV</span>
                                    <Button onClick={() => selectedApp && handleViewCV(selectedApp)}>
                                        Thử lại
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Academic & Personal Section */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin sinh viên</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">MSSV:</span>
                                                <span className="font-bold text-gray-900">{selectedApp?.studentId || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Khóa:</span>
                                                <span className="font-semibold">{selectedApp?.cohort || "N/A"}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Ngành học</p>
                                                <p className="text-sm font-medium leading-tight">{selectedApp?.major || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Khoa / Viện</p>
                                                <p className="text-sm text-gray-600 leading-tight">{selectedApp?.faculty || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Liên hệ</h4>
                                        <div className="bg-blue-50/50 p-4 rounded-xl space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{selectedApp?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{selectedApp?.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Status & Message Section */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trạng thái hồ sơ</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Hiện tại:</span>
                                                {selectedApp && getStatusBadge(selectedApp.status)}
                                            </div>
                                            <Select
                                                value={selectedApp?.status}
                                                onValueChange={(value) => selectedApp && handleStatusChange(selectedApp.id, value)}
                                            >
                                                <SelectTrigger className="w-full bg-white">
                                                    <SelectValue placeholder="Cập nhật trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Mới</SelectItem>
                                                    <SelectItem value="reviewed">Đã xem</SelectItem>
                                                    <SelectItem value="interviewed">Mời PV</SelectItem>
                                                    <SelectItem value="hired">Đã tuyển</SelectItem>
                                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="pt-2 border-t border-gray-100 italic text-[10px] text-gray-400">
                                                Ngày nộp: {selectedApp && formatDate(selectedApp.appliedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Lời giới thiệu
                                        </h4>

                                        <div className="bg-yellow-50/30 p-4 rounded-xl min-h-[140px]">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap italic">
                                                {selectedApp?.coverLetter
                                                    ? `"${selectedApp.coverLetter}"`
                                                    : "Không có lời nhắn."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default function ManageApplicationsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <ManageApplicationsContent />
        </Suspense>
    )
}
