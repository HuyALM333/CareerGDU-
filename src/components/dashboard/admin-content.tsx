"use client"

import { useEffect, useState } from "react"
import { Users, Briefcase, FileText, Star, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ReviewStats {
    total_reviews: number
    average_rating: number
    rating_distribution: Record<string, number>
    verified_count: number
    place_name: string
    google_maps_rating: number
    total_reviews_on_maps: number
    reviews_crawled: number
    crawl_date: string
}

export function AdminDashboardContent() {
    const [stats, setStats] = useState({
        users: 0,
        jobs: 0,
        applications: 0,
        contacts: 0
    })
    const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real app we would have an API for dashboard stats
        // For now we simulate or fetch individual lists length (inefficient but works for small app)
        const fetchData = async () => {
            try {
                // Fetch counts (simulated for now based on what we can access or dummy if APIs don't return count)
                // Actually we can fetch /api/applications?role=admin to get count
                const appRes = await fetch("/api/applications?role=admin")
                const appData = await appRes.json()

                const contactRes = await fetch("/api/contacts")
                const contactData = await contactRes.json()

                const jobRes = await fetch("/api/jobs")
                const jobData = await jobRes.json()

                // Fetch real Google review stats
                const reviewsRes = await fetch("/data/reviews-stats.json")
                const reviewsData = await reviewsRes.json()
                setReviewStats(reviewsData)

                setStats({
                    users: 15420, // Mock for now
                    jobs: jobData.success ? jobData.data.jobs.length : 0,
                    applications: appData.success ? appData.data.length : 0,
                    contacts: contactData.success ? contactData.data.length : 0
                })
            } catch (e) {
                console.error("Dashboard stats error", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn ứng tuyển</CardTitle>
                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.applications}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Đơn nộp trên hệ thống
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Việc làm đang đăng</CardTitle>
                        <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Briefcase size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.jobs}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tin tuyển dụng kích hoạt
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Liên hệ / Tin nhắn</CardTitle>
                        <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Users size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contacts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tin nhắn cần phản hồi
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đánh giá Google</CardTitle>
                        <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <Star size={18} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reviewStats ? `${reviewStats.average_rating}/5` : "---"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {reviewStats ? `${reviewStats.total_reviews} đánh giá (${reviewStats.total_reviews_on_maps} trên Maps)` : "Đang tải..."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Shortcuts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Truy cập nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                            <Link href="/dashboard/jobs">
                                <Briefcase className="h-6 w-6" />
                                Quản lý việc làm
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                            <Link href="/dashboard/applicants-manager">
                                <FileText className="h-6 w-6" />
                                Quản lý hồ sơ
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                            <Link href="/dashboard/messages">
                                <Users className="h-6 w-6" />
                                Tin nhắn
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                            <Link href="/dashboard/users">
                                <Star className="h-6 w-6" />
                                Người dùng
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Note */}
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Ghi chú quản trị</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Hệ thống đang hoạt động ổn định. Hãy kiểm tra thường xuyên mục <strong>Đơn ứng tuyển</strong> và <strong>Tin nhắn</strong> để phản hồi sinh viên sớm nhất.
                        </p>
                        <div className="mt-6">
                            <Button asChild>
                                <Link href="/">Về trang chủ website</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
