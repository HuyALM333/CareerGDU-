"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Loader2, Archive, Eye } from "lucide-react"
import { JobPreviewDialog, type Job } from "./job-preview-dialog"

// Types matching API response
// Use imported Job type from ./job-preview-dialog

export default function AdminJobsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const [previewJob, setPreviewJob] = useState<Job | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()
    const router = useRouter()

    // Fetch full job details for preview (includes description, requirements, benefits)
    const openJobPreview = async (jobId: string) => {
        setPreviewLoading(true)
        try {
            const res = await fetch(`/api/jobs/${jobId}`)
            const data = await res.json()
            if (data.success && data.data) {
                setPreviewJob(data.data)
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải chi tiết tin tuyển dụng",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error fetching job details:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải chi tiết tin tuyển dụng",
                variant: "destructive"
            })
        } finally {
            setPreviewLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading) {
            if (user?.role !== 'admin') {
                router.push('/dashboard')
                return
            }
            fetchJobs()
        }
    }, [user, authLoading, router])

    const fetchJobs = async () => {
        try {
            // Fetch all jobs including pending/rejected
            const response = await fetch('/api/jobs?status=all')
            const data = await response.json()
            if (data.success) {
                // Sort by postedAt descending
                const sortedJobs = (data.data.jobs || []).sort((a: Job, b: Job) =>
                    new Date((b as any).publishAt || b.postedAt).getTime() - new Date((a as any).publishAt || a.postedAt).getTime()
                )
                setJobs(sortedJobs)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể lấy danh sách tin tuyển dụng",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string, adminFeedback: string = "") => {
        try {
            const response = await fetch(`/api/jobs/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, adminFeedback: adminFeedback })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Cập nhật thành công",
                    description: `Trạng thái tin tuyển dụng đã được cập nhật thành: ${newStatus}`,
                })
                // Refresh list locally
                setJobs(prev => {
                    const newNow = new Date().toISOString()
                    const updated = prev.map(job =>
                        job._id === id ? {
                            ...job,
                            status: newStatus as any,
                            postedAt: job.postedAt
                        } : job
                    )
                    // Re-sort after status update because activation refreshes dates
                    return updated.sort((a, b) =>
                        new Date((b as any).publishAt || b.postedAt).getTime() - new Date((a as any).publishAt || a.postedAt).getTime()
                    )
                })
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi cập nhật",
                description: "Không thể cập nhật trạng thái.",
                variant: "destructive"
            })
        }
    }

    const openDeleteDialog = (job: Job) => {
        setJobToDelete(job)
        setDeleteDialogOpen(true)
    }

    const handleArchive = async () => {
        if (!jobToDelete) return

        try {
            const response = await fetch(`/api/jobs/${jobToDelete._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'closed' })
            })
            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Đã lưu trữ",
                    description: "Tin tuyển dụng đã được gỡ khỏi danh sách hiển thị nhưng vẫn được giữ trong hệ thống.",
                })
                setJobs(prev => prev.map(job => job._id === jobToDelete._id ? { ...job, status: 'closed' as any } : job))
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi lưu trữ",
                description: "Không thể gỡ tin tuyển dụng.",
                variant: "destructive"
            })
        } finally {
            setDeleteDialogOpen(false)
            setJobToDelete(null)
        }
    }

    const confirmReject = () => {
        if (selectedJobId) {
            handleStatusUpdate(selectedJobId, "rejected", feedback)
            setRejectDialogOpen(false)
            setFeedback("")
            setSelectedJobId(null)
        }
    }

    const openRejectDialog = (id: string) => {
        setSelectedJobId(id)
        setRejectDialogOpen(true)
    }

    const getStatusBadge = (job: Job) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const parseDateHelper = (dateVal: any) => {
            if (!dateVal) return new Date(0)
            if (dateVal instanceof Date) return dateVal
            if (typeof dateVal === 'string' && dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [day, month, year] = dateVal.split('/').map(Number)
                return new Date(year, month - 1, day)
            }
            return new Date(dateVal)
        }

        if (job.status === 'published') {
            if ((job as any).expiredAt) {
                const exp = new Date((job as any).expiredAt)
                exp.setHours(0, 0, 0, 0)
                if (exp < today) return <Badge variant="destructive">Hết hạn</Badge>
            }
            if (job.deadline && job.deadline !== "Vô thời hạn" && parseDateHelper(job.deadline) < today) {
                return <Badge variant="destructive">Hết hạn</Badge>
            }
        }

        switch (job.status) {
            case 'published': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đang hiển thị</Badge>
            case 'scheduled': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Lên lịch</Badge>
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>
            case 'rejected': return <Badge variant="destructive">Từ chối</Badge>
            case 'request_changes': return <Badge variant="outline" className="text-orange-600 border-orange-600">Cần sửa</Badge>
            case 'closed': return <Badge variant="secondary">Đã đóng</Badge>
            case 'expired': return <Badge variant="destructive">Hết hạn</Badge>
            default: return <Badge variant="outline">{job.status}</Badge>
        }
    }

    if (authLoading || isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
                    <p className="text-muted-foreground">Dyệt và quản lý các bài đăng tuyển dụng từ doanh nghiệp.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bài đăng</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table className="hidden lg:table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Ngày đăng</TableHead>
                                    <TableHead className="min-w-[200px]">Vị trí</TableHead>
                                    <TableHead className="min-w-[150px]">Doanh nghiệp</TableHead>
                                    <TableHead className="w-[150px]">Mức lương</TableHead>
                                    <TableHead className="w-[130px]">Trạng thái</TableHead>
                                    <TableHead className="text-center w-[180px]">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có tin tuyển dụng nào.</TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job._id}>
                                            <TableCell className="whitespace-nowrap">{new Date((job as any).publishAt || job.postedAt).toLocaleDateString("vi-VN")}</TableCell>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>{job.company}</TableCell>
                                            <TableCell>{job.salary}</TableCell>
                                            <TableCell>{getStatusBadge(job)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center items-center">
                                                    {/* Slot 1: Eye icon */}
                                                    <div className="flex items-center gap-1 mr-2 border-r pr-2 border-gray-100">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                            onClick={() => openJobPreview(job._id)}
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </div>

                                                    {/* Slot 2: Action buttons */}
                                                    <div className="w-[100px] flex justify-center">
                                                        {job.status === 'pending' && (
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                                    onClick={() => handleStatusUpdate(job._id, "published")}
                                                                    title="Duyệt bài"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => openRejectDialog(job._id)}
                                                                    title="Từ chối"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {job.status === 'published' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs"
                                                                onClick={() => openDeleteDialog(job)}
                                                            >
                                                                Gỡ bài
                                                            </Button>
                                                        )}

                                                        {(job.status === 'rejected' || job.status === 'request_changes') && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => openDeleteDialog(job)}
                                                                title="Gỡ bài / Lưu trữ"
                                                            >
                                                                <Archive className="h-4.5 w-4.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Mobile Card Layout */}
                        <div className="lg:hidden grid grid-cols-1 divide-y">
                            {jobs.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">Chưa có tin tuyển dụng nào.</div>
                            ) : (
                                jobs.map((job) => (
                                    <div key={job._id} className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-gray-900 leading-tight">{job.title}</h3>
                                                <p className="text-sm text-blue-600 font-medium">{job.company}</p>
                                            </div>
                                            {getStatusBadge(job)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs py-3 border-y border-gray-50 bg-gray-50/30 px-2 rounded-lg">
                                            <div>
                                                <p className="text-gray-400 font-bold uppercase mb-0.5">Ngày đăng</p>
                                                <p className="font-medium">{new Date((job as any).publishAt || job.postedAt).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 font-bold uppercase mb-0.5">Mức lương</p>
                                                <p className="font-medium">{job.salary}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-3 text-blue-600 font-bold"
                                                    onClick={() => openJobPreview(job._id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {job.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 h-9 px-4 font-bold"
                                                            onClick={() => handleStatusUpdate(job._id, "published")}
                                                        >
                                                            <Check className="h-4 w-4 mr-1.5" /> Duyệt
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-9 w-9 p-0"
                                                            onClick={() => openRejectDialog(job._id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}

                                                {job.status === 'published' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-9 px-4 text-red-600 border-red-200 font-bold"
                                                        onClick={() => openDeleteDialog(job)}
                                                    >
                                                        Gỡ bài
                                                    </Button>
                                                )}

                                                {(job.status === 'rejected' || job.status === 'request_changes') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-4 text-red-500 font-medium"
                                                        onClick={() => openDeleteDialog(job)}
                                                    >
                                                        <Archive className="h-4 w-4 mr-1.5" /> Lưu trữ
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối tin tuyển dụng</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối <span className="text-red-500 font-bold">*</span> để nhà tuyển dụng biết và chỉnh sửa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Nhập lý do tại đây (ví dụ: nội dung chưa rõ ràng, hình ảnh không phù hợp...)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className={!feedback.trim() ? "border-red-200 focus-visible:ring-red-500" : ""}
                        />
                        {!feedback.trim() && (
                            <p className="text-xs text-red-500 mt-2 italic">* Bạn không thể từ chối nếu không có lý do cụ thể.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setRejectDialogOpen(false)
                            setFeedback("")
                        }}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={!feedback.trim()}
                        >
                            Xác nhận từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận gỡ bài</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tin tuyển dụng <span className="font-semibold text-foreground">{jobToDelete?.title}</span> sẽ được gỡ khỏi danh sách hiển thị và chuyển sang trạng thái lưu trữ. Dữ liệu vẫn được giữ lại để audit và quản lý.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault()
                                handleArchive()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Gỡ bài
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <JobPreviewDialog
                job={previewJob}
                open={!!previewJob}
                onOpenChange={(open) => !open && setPreviewJob(null)}
            />
        </div>
    )
}
