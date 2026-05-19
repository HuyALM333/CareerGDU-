"use client"
// Deployment trigger: fixed linking issues

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, FileText, Users, RefreshCw } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"



const parseDateHelper = (dateVal: any) => {
    if (!dateVal) return new Date(0)
    if (dateVal instanceof Date) return dateVal
    if (typeof dateVal === 'string' && dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateVal.split('/').map(Number)
        return new Date(year, month - 1, day)
    }
    return new Date(dateVal)
}

function JobActions({
    job,
    setJobToDelete,
    setDeleteDialogOpen,
    setJobToRenew,
    setRenewDialogOpen
}: {
    job: any,
    setJobToDelete: (id: string) => void,
    setDeleteDialogOpen: (open: boolean) => void,
    setJobToRenew: (job: any) => void,
    setRenewDialogOpen: (open: boolean) => void
}) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isExpired = job.status === 'active' && job.deadline && job.deadline !== "Vô thời hạn" && parseDateHelper(job.deadline) < today

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={`/jobs/${job._id}`} target="_blank">
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                    </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/applicants-manager?jobId=${job._id}`}>
                    <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Xem ứng viên
                    </DropdownMenuItem>
                </Link>
                {(job.status === 'closed' || isExpired) && (
                    <DropdownMenuItem
                        onClick={() => {
                            setJobToRenew(job)
                            setRenewDialogOpen(true)
                        }}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Gia hạn tin
                    </DropdownMenuItem>
                )}
                <Link href={`/dashboard/jobs/${job._id}/edit`}>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => {
                        setJobToDelete(job._id)
                        setDeleteDialogOpen(true)
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa tin
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function MyJobsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Delete Dialog logic
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)

    // Renew Dialog logic
    const [renewDialogOpen, setRenewDialogOpen] = useState(false)
    const [jobToRenew, setJobToRenew] = useState<any | null>(null)
    const [newDeadline, setNewDeadline] = useState("")
    const [isRenewing, setIsRenewing] = useState(false)

    const userId = user?.id || user?._id

    useEffect(() => {
        if (userId) fetchJobs()
    }, [userId])

    const fetchJobs = async () => {
        if (!userId) return
        try {
            setLoading(true)
            const res = await fetch(`/api/jobs?creatorId=${userId}`)
            const data = await res.json()
            if (data.success) {
                const sorted = (data.data.jobs || []).sort((a: any, b: any) =>
                    new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
                )
                setJobs(sorted)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteJob = async () => {
        if (!jobToDelete) return

        try {
            const response = await fetch(`/api/jobs/${jobToDelete}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast({ title: "Xóa thành công", description: "Tin tuyển dụng đã được xóa." })
                setJobs(prev => prev.filter(job => job._id !== jobToDelete))
            } else {
                throw new Error(data.error)
            }
        } catch (e) {
            toast({ title: "Lỗi", description: "Không thể xóa tin.", variant: "destructive" })
        } finally {
            setDeleteDialogOpen(false)
            setJobToDelete(null)
        }
    }

    const handleRenewJob = async () => {
        if (!jobToRenew || !newDeadline) return

        try {
            setIsRenewing(true)
            const response = await fetch(`/api/jobs/${jobToRenew._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deadline: newDeadline,
                    status: 'published' // Reactivate if it was closed
                })
            })
            const data = await response.json()

            if (data.success) {
                toast({ title: "Gia hạn thành công", description: `Tin "${jobToRenew.title}" đã được gia hạn đến ${new Date(newDeadline).toLocaleDateString('vi-VN')}.` })
                fetchJobs() // Refresh the list
            } else {
                throw new Error(data.error)
            }
        } catch (e) {
            toast({ title: "Lỗi", description: "Không thể gia hạn tin tuyển dụng.", variant: "destructive" })
        } finally {
            setIsRenewing(false)
            setRenewDialogOpen(false)
            setJobToRenew(null)
            setNewDeadline("")
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkIsExpired = (job: any) => {
        if (job.status !== 'published') return false
        if (job.expiredAt) {
            const exp = new Date(job.expiredAt)
            exp.setHours(0, 0, 0, 0)
            return exp < today
        }
        return job.deadline && job.deadline !== "Vô thời hạn" && parseDateHelper(job.deadline) < today
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground truncate">
                        Quản lý tin đăng
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Quản lý tất cả các vị trí bạn đã đăng tuyển
                    </p>
                </div>
                <Link href="/dashboard/jobs/new" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Đăng tin mới
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tiêu đề..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="published">Đang hiển thị</option>
                                <option value="scheduled">Lên lịch</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="closed">Đã đóng</option>
                                <option value="expired">Hết hạn</option>
                                <option value="rejected">Bị từ chối</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Vị trí tuyển dụng</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Trạng thái</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-1/4 whitespace-nowrap">Phản hồi</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ứng viên</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ngày đăng</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td></tr>
                                    ) : filteredJobs.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Không tìm thấy tin đăng nào.</td></tr>
                                    ) : (
                                        filteredJobs.map((job) => (
                                            <tr key={`${job._id}-desktop`} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="font-semibold line-clamp-1">{job.title}</div>
                                                    <div className="text-xs text-muted-foreground">{job.location} • {job.type}</div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {checkIsExpired(job) ? (
                                                        <Badge variant="destructive">Hết hạn</Badge>
                                                    ) : (
                                                        <Badge variant={job.status === 'published' ? 'default' : job.status === 'pending' ? 'secondary' : job.status === 'closed' ? 'outline' : 'destructive'}>
                                                            {job.status === 'published' ? 'Đang hiển thị' : job.status === 'scheduled' ? 'Lên lịch' : job.status === 'pending' ? 'Chờ duyệt' : job.status === 'closed' ? 'Đã đóng' : job.status === 'expired' ? 'Hết hạn' : 'Từ chối'}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle text-sm">
                                                    {(job.status === 'rejected' || job.status === 'request_changes') && job.adminFeedback ? (
                                                        <span className="text-destructive font-medium line-clamp-2">{job.adminFeedback}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{job.applicants || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                                                    {new Date((job as any).publishAt || job.postedAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <JobActions
                                                        job={job}
                                                        setJobToDelete={setJobToDelete}
                                                        setDeleteDialogOpen={setDeleteDialogOpen}
                                                        setJobToRenew={setJobToRenew}
                                                        setRenewDialogOpen={setRenewDialogOpen}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile & Tablet Card Layout */}
                        <div className="lg:hidden divide-y">
                            {loading ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                    Đang tải dữ liệu...
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">Không tìm thấy tin đăng nào.</div>
                            ) : (
                                filteredJobs.map((job) => (
                                    <div key={`${job._id}-mobile`} className="p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base text-gray-900 leading-tight mb-1">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground font-medium">
                                                    <span>{job.location}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span>{job.type}</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <JobActions
                                                    job={job}
                                                    setJobToDelete={setJobToDelete}
                                                    setDeleteDialogOpen={setDeleteDialogOpen}
                                                    setJobToRenew={setJobToRenew}
                                                    setRenewDialogOpen={setRenewDialogOpen}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <Badge variant={job.status === 'active' ? (checkIsExpired(job) ? 'destructive' : 'default') : job.status === 'pending' ? 'secondary' : job.status === 'closed' ? 'outline' : 'destructive'} className="text-[10px] px-2 py-0.5">
                                                {job.status === 'active' ? (checkIsExpired(job) ? 'Hết hạn' : 'Hoạt động') : job.status === 'pending' ? 'Chờ duyệt' : job.status === 'closed' ? 'Đã đóng' : 'Từ chối'}
                                            </Badge>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{job.applicants || 0} ứng viên</span>
                                                </div>
                                                <span>{new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>

                                        {(job.status === 'rejected' || job.status === 'request_changes') && job.adminFeedback && (
                                            <div className="mt-2 p-3 bg-destructive/5 rounded-lg text-xs text-destructive font-medium border border-destructive/10">
                                                Phản hồi: {job.adminFeedback}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa tin tuyển dụng?</DialogTitle>
                        <DialogDescription>
                            Tin này sẽ bị xóa khỏi hệ thống và không thể khôi phục.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDeleteJob}>Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gia hạn tin tuyển dụng</DialogTitle>
                        <DialogDescription>
                            Chọn ngày hết hạn mới cho tin tuyển dụng <strong>{jobToRenew?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Hạn chót mới</label>
                            <Input
                                type="date"
                                value={newDeadline}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setNewDeadline(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleRenewJob}
                            disabled={!newDeadline || isRenewing}
                        >
                            {isRenewing ? "Đang xử lý..." : "Gia hạn ngay"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
