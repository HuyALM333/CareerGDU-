"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { FileText, Clock, Briefcase, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const statusLabels = {
    pending: "Đã ứng tuyển",
    reviewed: "Đang chờ",
    interviewed: "Mời phỏng vấn",
    hired: "Đã trúng tuyển",
    rejected: "Từ chối",
}

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    interviewed: "bg-purple-100 text-purple-800",
    hired: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

type Status = keyof typeof statusLabels

export function StudentDashboardContent() {
    const { user } = useAuth()
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchApps = async () => {
            if (user?.id) {
                setLoading(true)
                setApplications([])
                try {
                    const res = await fetch(`/api/applications`)
                    const data = await res.json()
                    if (data.success) {
                        setApplications(data.data)
                    }
                } catch (e) {
                    console.error("Fetch student apps error", e)
                } finally {
                    setLoading(false)
                }
            } else {
                setApplications([])
                setLoading(false)
            }
        }
        fetchApps()
    }, [user])

    const getStatus = (a: any): Status =>
        (a.status || 'pending').toLowerCase() as Status

    const appliedCount = applications.filter(a =>
        getStatus(a) === 'pending'
    ).length

    const waitingCount = applications.filter(a =>
        getStatus(a) === 'reviewed'
    ).length

    const interviewCount = applications.filter(a =>
        getStatus(a) === 'interviewed'
    ).length

    const hiredCount = applications.filter(a =>
        getStatus(a) === 'hired'
    ).length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            {/* Welcome Banner */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xin chào, {user?.name}!</h2>
                <p className="text-gray-600 mb-6 max-w-2xl">
                    Chúc bạn một ngày tốt lành! Bạn có <strong>{waitingCount} đơn ứng tuyển</strong> đang chờ phản hồi.
                    Hãy bắt đầu hành trình sự nghiệp của mình ngay hôm nay.
                </p>
                <div className="flex gap-3">
                    <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-semibold" asChild>
                        <Link href="/jobs">Tìm việc ngay</Link>
                    </Button>
                    <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50" asChild>
                        <Link href="/dashboard/profile">Cập nhật hồ sơ</Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{appliedCount}</div>
                        <div className="text-sm text-muted-foreground">Đã ứng tuyển</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">{waitingCount}</div>
                        <div className="text-sm text-muted-foreground">Đang chờ</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">{interviewCount}</div>
                        <div className="text-sm text-muted-foreground">Phỏng vấn</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{hiredCount}</div>
                        <div className="text-sm text-muted-foreground">Đã trúng tuyển</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Apps */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Đơn ứng tuyển gần đây</CardTitle>
                        <Link href="/dashboard/applications" className="text-sm text-blue-600 hover:underline flex items-center">
                            Xem tất cả <ChevronRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {applications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Bạn chưa ứng tuyển công việc nào.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.slice(0, 4).map((app: any) => {
                                    const status = getStatus(app)

                                    return (
                                        <div key={app._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                    <Briefcase className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {app.job?.title || "Không có tiêu đề"}
                                                    </div>

                                                    <div className="text-xs text-muted-foreground">
                                                        {app.job?.company || "Không có công ty"}
                                                    </div>
                                                </div>
                                            </div>

                                            <Badge
                                                variant="outline"
                                                className={`${statusColors[status]} border-0`}
                                            >
                                                {statusLabels[status]}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Suggested Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lời khuyên</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Hoàn thiện 100% hồ sơ để nhà tuyển dụng chú ý hơn.</p>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Bật thông báo email để không bỏ lỡ lịch phỏng vấn.</p>
                        </div>
                        <div className="flex gap-3">
                            <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Tham khảo các việc làm "Hot" trong tuần này.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
