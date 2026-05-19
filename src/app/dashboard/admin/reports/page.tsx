"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
    Flag, ExternalLink, Mail, Phone, Clock, CheckCircle, XCircle,
    AlertTriangle, MessageSquare, Send, Loader2, User, Building2,
    ShieldAlert, Trash2, EyeOff, BarChart3, Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

interface Report {
    _id: string
    jobId: string
    jobTitle: string
    companyName: string
    reporterName: string
    reporterPhone: string
    reporterEmail: string
    reporterUserId?: string
    content: string
    status: 'pending' | 'resolved' | 'dismissed'
    adminResponse?: string
    jobAction?: 'none' | 'hide' | 'delete'
    createdAt: string
    resolvedAt?: string
}

export default function AdminReportsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    // Resolution state
    const [resolutionOpen, setResolutionOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [resolutionData, setResolutionData] = useState({
        status: 'resolved' as 'resolved' | 'dismissed',
        adminResponse: "",
        jobAction: 'none' as 'none' | 'hide' | 'delete'
    })
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchReports()
    }, [user])

    const fetchReports = async () => {
        if (user?.role !== 'admin') {
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/reports')
            const data = await res.json()
            if (data.success) {
                setReports(data.reports)
            }
        } catch (error) {
            console.error("Failed to fetch reports", error)
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể tải danh sách báo cáo.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const openResolution = (report: Report) => {
        setSelectedReport(report)
        setResolutionData({
            status: report.status === 'pending' ? 'resolved' : report.status as any,
            adminResponse: report.adminResponse || "",
            jobAction: report.jobAction || 'none'
        })
        setResolutionOpen(true)
    }

    const handleResolve = async () => {
        if (!selectedReport) return
        if (!resolutionData.adminResponse.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập phản hồi xử lý.",
                variant: "destructive"
            })
            return
        }

        try {
            setProcessingId(selectedReport._id)
            const res = await fetch('/api/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: selectedReport._id,
                    ...resolutionData
                })
            })

            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật trạng thái báo cáo và xử lý tin tuyển dụng.",
                })
                setResolutionOpen(false)
                fetchReports()
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xử lý báo cáo. Vui lòng thử lại.",
                variant: "destructive"
            })
        } finally {
            setProcessingId(null)
        }
    }

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        handled: reports.filter(r => r.status !== 'pending').length
    }

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Card className="max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Truy cập bị từ chối</h2>
                        <p className="text-gray-500">Bạn cần quyền quản trị viên để xem trang này.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-20">
            {/* Header section with Stats */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a88] p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
                            <Flag className="h-8 w-8 sm:h-9 sm:w-9 text-red-400" />
                            Quản lý Báo cáo
                        </h1>
                        <p className="text-blue-100/80 mt-2 text-sm sm:text-lg">Hệ thống giám sát và xử lý phản ánh tin tuyển dụng.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 flex-1 lg:min-w-[120px]">
                            <p className="text-blue-100/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Tổng cộng</p>
                            <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-3 sm:p-4 flex-1 lg:min-w-[120px]">
                            <p className="text-red-100/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Chờ xử lý</p>
                            <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 text-red-200">{stats.pending}</p>
                        </div>
                        <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-3 sm:p-4 flex-1 lg:min-w-[120px]">
                            <p className="text-green-100/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Đã xong</p>
                            <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 text-green-200">{stats.handled}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            <p className="text-gray-500 font-medium">Đang đồng bộ hóa dữ liệu báo cáo...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100"
                        >
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Hệ thống đang sạch!</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                                Hiện tại không có báo cáo vi phạm nào cần xử lý. Hãy duy trì môi trường tuyển dụng chất lượng!
                            </p>
                        </motion.div>
                    ) : (
                        reports.map((report, index) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 relative group bg-white ring-1 ring-gray-100">
                                    {/* Status vertical bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${report.status === 'pending' ? 'bg-red-500' :
                                        report.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />

                                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-4 sm:px-6 md:px-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${report.status === 'pending' ? 'bg-red-100 text-red-600' :
                                                    report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <Flag className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1 sm:mb-0.5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Tin bị báo cáo</span>
                                                        <Badge variant={report.status === 'pending' ? 'destructive' : report.status === 'resolved' ? 'default' : 'secondary'} className="px-1.5 py-0 h-4 sm:h-5 text-[9px] sm:text-[10px] uppercase font-bold tracking-tight shrink-0">
                                                            {report.status === 'pending' ? 'Chờ xử lý' : report.status === 'resolved' ? 'Vi phạm' : 'Hợp lệ'}
                                                        </Badge>
                                                    </div>
                                                    <Link href={`/jobs/${report.jobId}`} target="_blank" className="text-sm sm:text-base md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 leading-tight group-hover:underline">
                                                        <span className="truncate">{report.jobTitle}</span>
                                                        <ExternalLink className="h-3 w-3 sm:h-4 w-4 shrink-0" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1">
                                                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100">
                                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                                                    {new Date(report.createdAt).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit'
                                                    })}
                                                </div>
                                                {report.jobAction && report.jobAction !== 'none' && (
                                                    <Badge className="bg-red-50 text-red-600 border-red-100 text-[9px] sm:text-[10px] py-0 px-1.5 sm:px-2 h-4 sm:h-5">
                                                        {report.jobAction === 'delete' ? 'Đã xóa tin' : 'Đã gỡ tin'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        <div className="grid lg:grid-cols-12">
                                            {/* Left side: Reporter & Metadata */}
                                            <div className="lg:col-span-4 bg-gray-50/30 p-4 sm:p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-6">
                                                <div>
                                                    <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Người báo cáo</label>
                                                    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <div className="overflow-hidden min-w-0">
                                                            <p className="font-bold text-gray-900 truncate text-sm sm:text-base">{report.reporterName}</p>
                                                            <div className="flex flex-col gap-1 mt-1 text-[12px] sm:text-sm text-gray-500">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Phone className="h-3 w-3" />
                                                                    {report.reporterPhone}
                                                                </span>
                                                                {report.reporterEmail && (
                                                                    <span className="flex items-center gap-1.5 truncate">
                                                                        <Mail className="h-3 w-3" />
                                                                        {report.reporterEmail}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {report.reporterUserId && (
                                                                <Badge variant="outline" className="mt-2 text-[9px] sm:text-[10px] py-0 px-1.5 h-4 bg-blue-50 text-blue-700 border-blue-200">
                                                                    Thành viên hệ thống
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Đơn vị bị báo cáo</label>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                            <Building2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-sm sm:text-base truncate">{report.companyName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side: Content & Action */}
                                            <div className="lg:col-span-8 p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-6 sm:gap-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Nội dung phản ánh</label>
                                                        <div className="bg-red-50/50 p-4 sm:p-5 rounded-2xl border border-red-100 text-red-900/80 leading-relaxed text-sm sm:text-base italic relative">
                                                            <span className="text-2xl sm:text-3xl font-serif text-red-100 absolute -top-1 -left-1">"</span>
                                                            {report.content}
                                                            <span className="text-2xl sm:text-3xl font-serif text-red-100 absolute -bottom-4 right-1">"</span>
                                                        </div>
                                                    </div>

                                                    {report.adminResponse && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-100 relative"
                                                        >
                                                            <label className="text-[10px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Phản hồi của QT Viên</label>
                                                            <div className="flex gap-3 text-blue-900">
                                                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-sm sm:text-base leading-relaxed">{report.adminResponse}</p>
                                                                    {report.resolvedAt && (
                                                                        <p className="text-[9px] sm:text-[10px] text-blue-400 mt-2 font-medium flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            Đã xử lý: {new Date(report.resolvedAt).toLocaleString('vi-VN')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end sm:pt-4">
                                                    <Button
                                                        size="lg"
                                                        onClick={() => openResolution(report)}
                                                        className={`rounded-xl sm:rounded-2xl px-6 sm:px-8 h-11 sm:h-12 shadow-lg transition-all duration-300 w-full sm:w-auto ${report.status === 'pending'
                                                            ? "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                                            : "bg-white text-blue-600 border-2 border-blue-50 hover:bg-blue-50 shadow-none text-sm sm:text-base"
                                                            }`}
                                                    >
                                                        {report.status === 'pending' ? (
                                                            <>
                                                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                                                <span className="text-sm sm:text-base">Thực hiện xử lý</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                                                <span className="text-sm sm:text-base">Chỉnh sửa xử lý</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Resolution Dialog - Redesigned */}
            <Dialog open={resolutionOpen} onOpenChange={setResolutionOpen}>
                <DialogContent className="max-w-[600px] w-[95vw] sm:rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8 text-white relative">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 sm:gap-3 pr-8">
                                <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7 text-blue-200 shrink-0" />
                                <span className="truncate">Quyết định xử lý</span>
                            </DialogTitle>
                            <DialogDescription className="text-blue-100/70 text-xs sm:text-base mt-1">
                                Xác thực phản ánh và đưa ra quyết định xử lý.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* Summary info box */}
                        {selectedReport && (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tin tuyển dụng</p>
                                    <p className="font-bold text-gray-800 truncate">{selectedReport.jobTitle}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6 sm:gap-8">
                            {/* Step 1: Status */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">1</div>
                                    <Label className="text-sm sm:text-base font-bold">Kết luận báo cáo</Label>
                                </div>
                                <RadioGroup
                                    value={resolutionData.status}
                                    onValueChange={(val: any) => setResolutionData({ ...resolutionData, status: val })}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                                >
                                    <div className={`transition-all duration-300 rounded-2xl border-2 p-3 sm:p-4 cursor-pointer flex flex-col gap-1.5 sm:gap-2 ${resolutionData.status === 'resolved' ? "border-red-500 bg-red-50/50" : "border-gray-100 bg-white hover:border-blue-200"
                                        }`}>
                                        <RadioGroupItem value="resolved" id="resolved" className="sr-only" />
                                        <Label htmlFor="resolved" className="cursor-pointer font-bold flex items-center gap-2 text-red-700 text-sm sm:text-base">
                                            <AlertTriangle className="h-4 w-4 shrink-0" /> Xác nhận vi phạm
                                        </Label>
                                        <p className="text-[10px] sm:text-xs text-red-600/70 leading-relaxed">Tin không chính xác, lừa đảo hoặc vi phạm điều khoản.</p>
                                    </div>
                                    <div className={`transition-all duration-300 rounded-2xl border-2 p-3 sm:p-4 cursor-pointer flex flex-col gap-1.5 sm:gap-2 ${resolutionData.status === 'dismissed' ? "border-green-500 bg-green-50/50" : "border-gray-100 bg-white hover:border-blue-200"
                                        }`}>
                                        <RadioGroupItem value="dismissed" id="dismissed" className="sr-only" />
                                        <Label htmlFor="dismissed" className="cursor-pointer font-bold flex items-center gap-2 text-green-700 text-sm sm:text-base">
                                            <CheckCircle className="h-4 w-4 shrink-0" /> Bỏ qua báo cáo
                                        </Label>
                                        <p className="text-[10px] sm:text-xs text-green-600/70 leading-relaxed">Báo cáo không đúng thực tế, tin tuyển dụng vẫn hợp lệ.</p>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Step 2: Job Action (Only if confirmed violation) */}
                            {resolutionData.status === 'resolved' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">2</div>
                                        <Label className="text-sm sm:text-base font-bold">Hành động trực tiếp với tin</Label>
                                    </div>
                                    <RadioGroup
                                        value={resolutionData.jobAction}
                                        onValueChange={(val: any) => setResolutionData({ ...resolutionData, jobAction: val })}
                                        className="space-y-2.5 sm:space-y-3"
                                    >
                                        <div className="flex items-center space-x-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                                            <RadioGroupItem value="none" id="act-none" />
                                            <Label htmlFor="act-none" className="cursor-pointer flex items-center gap-2 font-medium text-sm sm:text-base">
                                                Duy trì trạng thái hiện tại
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-orange-200 transition-all group">
                                            <RadioGroupItem value="hide" id="act-hide" />
                                            <Label htmlFor="act-hide" className="cursor-pointer flex flex-1 items-center justify-between font-medium group-hover:text-orange-600 text-sm sm:text-base">
                                                <span className="flex items-center gap-2">
                                                    <EyeOff className="h-4 w-4" /> Gỡ tin ngay
                                                </span>
                                                <Badge className="bg-orange-100 text-orange-600 border-none text-[9px] sm:text-[10px]">Đề xuất</Badge>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-red-200 transition-all group">
                                            <RadioGroupItem value="delete" id="act-delete" />
                                            <Label htmlFor="act-delete" className="cursor-pointer flex flex-1 items-center justify-between font-medium group-hover:text-red-600 text-gray-500 text-sm sm:text-base">
                                                <span className="flex items-center gap-2 font-bold shrink-0">
                                                    <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
                                                </span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {/* Step 3: Response */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {resolutionData.status === 'resolved' ? 3 : 2}
                                    </div>
                                    <Label className="text-base font-bold">Nội dung phản hồi cho người báo cáo</Label>
                                </div>
                                <Textarea
                                    id="response"
                                    placeholder="Vui lòng nhập lời giải thích hoặc cảm ơn người báo cáo..."
                                    rows={4}
                                    className="rounded-2xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 p-4"
                                    value={resolutionData.adminResponse}
                                    onChange={(e) => setResolutionData({ ...resolutionData, adminResponse: e.target.value })}
                                />
                                {selectedReport?.reporterUserId && (
                                    <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-xs">
                                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                                        <p className="leading-relaxed">
                                            Bạn đang trả lời báo cáo từ thành viên <b>{selectedReport.reporterName}</b>. Hệ thống sẽ tự động gửi thông báo trực tiếp đến họ.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setResolutionOpen(false)}
                            className="rounded-xl px-6 h-12"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                            onClick={handleResolve}
                            disabled={!!processingId}
                        >
                            {processingId ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Đang đồng bộ...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 mr-2" />
                                    Xác nhận & Hoàn tất
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

