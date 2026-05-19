"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Eye,
    UserCheck,
    Globe,
    Monitor,
    Smartphone,
    RefreshCw,
    Calendar,
    Download,
    Trash2,
    AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Visitor {
    _id: string
    ip: string
    userAgent: string
    page: string
    referrer?: string
    userId?: string
    userName?: string
    visitedAt: string
    device?: string
}

interface Stats {
    totalVisitors: number
    todayVisitors: number
    uniqueVisitors: number
    loggedInUsers: number
    topPages: { page: string; count: number }[]
}

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState<Visitor[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState(7)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { toast } = useToast()
    const [exporting, setExporting] = useState(false)
    const [cleaning, setCleaning] = useState(false)
    const [cleanupDays, setCleanupDays] = useState(90)
    const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)

    const fetchVisitors = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/visitors?days=${days}&page=${page}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setVisitors(data.data)
                setStats(data.stats)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error("Error fetching visitors:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVisitors()
    }, [days, page])

    const handleExport = async () => {
        try {
            setExporting(true)
            const response = await fetch(`/api/visitors?days=${days}&download=true`)
            const data = await response.json()

            if (data.success && data.data) {
                const headers = ["ID", "IP", "Trang", "Thiết bị", "Người dùng", "Thời gian"]
                const rows = data.data.map((v: Visitor) => [
                    v._id,
                    v.ip,
                    v.page,
                    v.device || "Unknown",
                    v.userName || "Khách",
                    new Date(v.visitedAt).toLocaleString("vi-VN")
                ])

                const csvContent = [
                    headers.join(","),
                    ...rows.map((r: any[]) => r.map(cell => `"${cell}"`).join(","))
                ].join("\n")

                const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.setAttribute("href", url)
                link.setAttribute("download", `visitors_data_${days}days_${new Date().toLocaleDateString()}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast({
                    title: "Xuất dữ liệu thành công",
                    description: `Đã tải xuống dữ liệu của ${days} ngày qua.`
                })
            }
        } catch (error) {
            console.error("Export error:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xuất dữ liệu.",
                variant: "destructive"
            })
        } finally {
            setExporting(false)
        }
    }

    const handleCleanup = async () => {
        try {
            setCleaning(true)
            const response = await fetch(`/api/visitors?days=${cleanupDays}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Dọn dẹp thành công",
                    description: data.message
                })
                fetchVisitors()
                setCleanupDialogOpen(false)
            }
        } catch (error) {
            console.error("Cleanup error:", error)
            toast({
                title: "Lỗi",
                description: "Không thể dọn dẹp dữ liệu.",
                variant: "destructive"
            })
        } finally {
            setCleaning(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Globe className="h-4 w-4" />
        if (device.includes("Mobile")) return <Smartphone className="h-4 w-4" />
        return <Monitor className="h-4 w-4" />
    }

    return (
        <div className="space-y-8 p-1 sm:p-2 lg:p-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                        Khách <br className="sm:hidden" /> truy cập
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Theo dõi lượt truy cập website
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <select
                            value={days}
                            onChange={(e) => {
                                setDays(Number(e.target.value))
                                setPage(1)
                            }}
                            className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 appearance-none hover:bg-gray-50/50 hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary/10"
                        >
                            <option value={1}>Hôm nay</option>
                            <option value={7}>7 ngày</option>
                            <option value={30}>30 ngày</option>
                            <option value={90}>90 ngày</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                            <RefreshCw className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleExport}
                            disabled={exporting || loading}
                            className="flex-1 sm:flex-none h-11 px-6 rounded-2xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                        >
                            <Download className="h-4 w-4 mr-2 text-primary" />
                            Xuất CSV
                        </Button>

                        <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-11 px-4 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-2">Dọn dẹp</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Dọn dẹp dữ liệu cũ</DialogTitle>
                                    <DialogDescription className="text-base">
                                        Hành động này sẽ xóa các bản ghi lịch sử truy cập để giải phóng dung lượng.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-6 space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-amber-800 text-sm">
                                        <div className="p-2 bg-amber-100 rounded-xl">
                                            <AlertTriangle className="h-5 w-5 shrink-0" />
                                        </div>
                                        <span className="font-medium pt-1">Nên xuất dữ liệu CSV trước khi xóa để lưu trữ an toàn.</span>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Giữ lại dữ liệu trong vòng:</label>
                                        <select
                                            value={cleanupDays}
                                            onChange={(e) => setCleanupDays(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all appearance-none font-medium"
                                        >
                                            <option value={30}>30 ngày gần đây</option>
                                            <option value={60}>60 ngày gần đây</option>
                                            <option value={90}>90 ngày gần đây</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground ml-1">Các bản ghi cũ hơn mốc này sẽ bị xóa vĩnh viễn.</p>
                                    </div>
                                </div>
                                <DialogFooter className="flex-col sm:flex-row gap-3">
                                    <Button variant="outline" onClick={() => setCleanupDialogOpen(false)} className="h-11 rounded-2xl flex-1 font-semibold">
                                        Hủy
                                    </Button>
                                    <Button variant="destructive" onClick={handleCleanup} disabled={cleaning} className="h-11 rounded-2xl flex-1 font-bold shadow-lg shadow-red-500/20">
                                        {cleaning ? (
                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                        ) : null}
                                        {cleaning ? "Đang xóa..." : "Xác nhận xóa"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchVisitors}
                            disabled={loading}
                            className="h-11 w-11 rounded-2xl border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} text-gray-600`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tổng lượt truy cập</CardTitle>
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                            <Eye className="h-5 w-5 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-4xl font-extrabold tracking-tight text-gray-900">{stats?.totalVisitors || 0}</div>
                            <p className="text-sm font-medium text-gray-400">
                                Trong {days} ngày qua
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-none shadow-xl shadow-green-200/30 bg-white hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-green-700/70 uppercase tracking-wider">Hôm nay</CardTitle>
                        <div className="p-2 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-4xl font-extrabold tracking-tight text-green-600">{stats?.todayVisitors || 0}</div>
                            <p className="text-sm font-medium text-green-600/60">
                                Từ 00:00 đến hiện tại
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-none shadow-xl shadow-blue-200/30 bg-white hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-blue-700/70 uppercase tracking-wider">Khách unique (IP)</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-4xl font-extrabold tracking-tight text-blue-600">{stats?.uniqueVisitors || 0}</div>
                            <p className="text-sm font-medium text-blue-600/60">
                                Địa chỉ IP khác nhau
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-none shadow-xl shadow-purple-200/30 bg-white hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-purple-700/70 uppercase tracking-wider">Đã đăng nhập</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-4xl font-extrabold tracking-tight text-purple-600">{stats?.loggedInUsers || 0}</div>
                            <p className="text-sm font-medium text-purple-600/60">
                                Users có tài khoản
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Pages Section */}
            {stats?.topPages && stats.topPages.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 ml-1 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Trang xem nhiều
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {stats.topPages.map((p, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-default"
                            >
                                <span className="text-sm font-bold text-gray-700">{p.page}</span>
                                <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-primary/10 text-primary text-xs font-black rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                    {p.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Visitors Table/Cards Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Chi tiết lượt truy cập</h2>
                    <p className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest">Live</p>
                </div>

                <Card className="border-none shadow-2xl shadow-gray-200/60 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="relative">
                                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-500 animate-pulse">Đang đồng bộ dữ liệu...</p>
                            </div>
                        ) : visitors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4 grayscale opacity-50">
                                <div className="p-6 bg-gray-50 rounded-full">
                                    <Globe className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="text-lg font-bold text-gray-500">
                                    Chưa có lượt truy cập nào
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow className="hover:bg-transparent border-gray-100">
                                                <TableHead className="font-bold text-gray-600 h-14 px-6">Thời gian</TableHead>
                                                <TableHead className="font-bold text-gray-600 h-14 px-6">Trang</TableHead>
                                                <TableHead className="font-bold text-gray-600 h-14 px-6">Thiết bị</TableHead>
                                                <TableHead className="font-bold text-gray-600 h-14 px-6">Người dùng</TableHead>
                                                <TableHead className="font-bold text-gray-600 h-14 px-6">IP Address</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visitors.map((visitor) => (
                                                <TableRow key={visitor._id} className="group hover:bg-primary/[0.02] border-gray-50 transition-colors">
                                                    <TableCell className="px-6 py-5">
                                                        <span className="text-sm font-bold text-gray-700">{formatTime(visitor.visitedAt)}</span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <Badge variant="outline" className="font-mono text-[11px] bg-gray-50 border-gray-200 text-gray-600 px-3 py-1 rounded-lg">
                                                            {visitor.page}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-gray-100 rounded-xl text-gray-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                                {getDeviceIcon(visitor.device)}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {visitor.device || "Unknown"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        {visitor.userName ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                                                <span className="text-sm font-bold text-gray-800">{visitor.userName}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm font-medium">Khách vãng lai</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <span className="font-mono text-xs text-gray-400 group-hover:text-gray-600 transition-colors bg-gray-50 group-hover:bg-gray-100 px-2 py-1 rounded-md">
                                                            {visitor.ip}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden p-4 space-y-4">
                                    {visitors.map((visitor) => (
                                        <div key={visitor._id} className="relative group p-5 rounded-3xl border border-gray-100 bg-white shadow-lg shadow-gray-200/20 active:scale-95 transition-all overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                {getDeviceIcon(visitor.device)}
                                            </div>

                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <div className="text-[11px] font-black text-primary/50 uppercase tracking-widest">
                                                        {formatTime(visitor.visitedAt).split(' ')[1]}
                                                    </div>
                                                    <div className="text-sm font-extrabold text-gray-800">
                                                        {formatTime(visitor.visitedAt).split(' ')[0]}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                                        <div className="text-gray-400">
                                                            {getDeviceIcon(visitor.device)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500">{visitor.device || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-gray-50 border-gray-100 text-gray-500 px-3 py-1 rounded-xl truncate max-w-[180px]">
                                                        {visitor.page}
                                                    </Badge>
                                                    {visitor.userName ? (
                                                        <span className="text-[11px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                            {visitor.userName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Khách</span>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-mono text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1 w-1 bg-primary/30 rounded-full" />
                                                        IP: {visitor.ip}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-6 border-t border-gray-50 bg-gray-50/30">
                                        <div className="hidden sm:block text-sm font-bold text-gray-500">
                                            Trang <span className="text-primary">{page}</span> / <span className="text-gray-800">{totalPages}</span>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPage(p => Math.max(1, p - 1))
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                disabled={page === 1}
                                                className="h-10 px-5 rounded-2xl border-gray-200 font-bold flex-1 sm:flex-none hover:bg-white hover:shadow-md transition-all disabled:opacity-30"
                                            >
                                                Trước
                                            </Button>
                                            <div className="sm:hidden flex items-center justify-center font-bold text-xs text-gray-500 flex-none px-2">
                                                {page}/{totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPage(p => Math.min(totalPages, p + 1))
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                disabled={page === totalPages}
                                                className="h-10 px-5 rounded-2xl border-gray-200 font-bold flex-1 sm:flex-none hover:bg-white hover:shadow-md transition-all disabled:opacity-30"
                                            >
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
