"use client"

import { useState, useEffect } from "react"
import { Save, Settings, Info, Tag, Layout, Sparkles, AlertCircle, Eye, ArrowRight, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SiteConfig {
    _id?: string
    key: string
    title: string
    description: string
    hotTags: string[]
    isActive: boolean
}

const CONFIG_KEYS = {
    HOME_QUICK_SEARCH: "home_quick_search",
    HOME_FEATURED_JOBS: "home_featured_jobs",
    HOME_MAJORS: "home_majors",
    SITE_FOOTER: "site_footer",
}

export default function AdminSettingsPage() {
    const [configs, setConfigs] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("home")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states for different sections
    const [quickSearch, setQuickSearch] = useState<any>(null)
    const [tagInput, setTagInput] = useState("")

    const [featuredJobs, setFeaturedJobs] = useState<any>(null)
    const [majorsConfig, setMajorsConfig] = useState<any>(null)
    const [footerConfig, setFooterConfig] = useState<any>(null)

    useEffect(() => {
        fetchConfigs()
    }, [])

    const fetchConfigs = async () => {
        try {
            const res = await fetch("/api/admin/site-configs")
            const data = await res.json()
            if (data.success) {
                setConfigs(data.data)

                // Initialize section states
                const qs = data.data.find((c: any) => c.key === CONFIG_KEYS.HOME_QUICK_SEARCH)
                if (qs) {
                    setQuickSearch(qs)
                    setTagInput(Array.isArray(qs.hotTags) ? qs.hotTags.join(", ") : "")
                } else {
                    setQuickSearch({
                        key: CONFIG_KEYS.HOME_QUICK_SEARCH,
                        title: "Bạn đã sẵn sàng đón đầu xu hướng?",
                        description: "Khám phá ngay hàng ngàn cơ hội việc làm hấp dẫn phù hợp với kỹ năng của bạn.",
                        hotTags: ["#Intern", "#ReactJS", "#Marketing", "#Designer", "#AI"],
                        isActive: true
                    })
                    setTagInput("#Intern, #ReactJS, #Marketing, #Designer, #AI")
                }

                const fj = data.data.find((c: any) => c.key === CONFIG_KEYS.HOME_FEATURED_JOBS)
                setFeaturedJobs(fj || {
                    key: CONFIG_KEYS.HOME_FEATURED_JOBS,
                    title: "Việc làm nổi bật",
                    description: "Cơ hội việc làm hấp dẫn dành cho sinh viên GDU",
                    isActive: true
                })

                const mj = data.data.find((c: any) => c.key === CONFIG_KEYS.HOME_MAJORS)
                setMajorsConfig(mj || {
                    key: CONFIG_KEYS.HOME_MAJORS,
                    badge: "việc làm đang tuyển",
                    title: "Khám phá theo Lĩnh vực",
                    description: "Tìm kiếm cơ hội việc làm phù hợp với ngành học và đam mê của bạn",
                    isActive: true
                })

                const ft = data.data.find((c: any) => c.key === CONFIG_KEYS.SITE_FOOTER)
                setFooterConfig(ft || {
                    key: CONFIG_KEYS.SITE_FOOTER,
                    brandDescription: "Cổng thông tin việc làm chính thức dành cho sinh viên Đại học Gia Định. Kết nối nhân tài trẻ với cộng đồng doanh nghiệp uy tín, kiến tạo tương lai vững chắc.",
                    centerName: "Trung tâm Trải nghiệm & Việc làm",
                    address: "371 Nguyễn Kiệm, Phường Hạnh Thông, Tp. Hồ Chí Minh",
                    email: "Studentcentre@giadinh.edu.vn",
                    facebook: "https://www.facebook.com/GDUStudentCenter",
                    supportTitle: "Bạn cần hỗ trợ trực tiếp?",
                    supportDescription: "Đội ngũ tư vấn viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.",
                    isActive: true
                })
            }
        } catch (error) {
            toast.error("Không thể tải cấu hình")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (section: string) => {
        setSaving(true)
        let configToSave = null

        if (section === "quickSearch") {
            const hotTags = tagInput.split(",").map(t => t.trim()).filter(Boolean)
            configToSave = { ...quickSearch, hotTags }
        } else if (section === "featuredJobs") {
            configToSave = featuredJobs
        } else if (section === "majors") {
            configToSave = majorsConfig
        } else if (section === "footer") {
            configToSave = footerConfig
        }

        if (!configToSave) return

        try {
            const res = await fetch("/api/admin/site-configs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: configToSave._id,
                    ...configToSave
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Đã lưu cấu hình thành công")
                fetchConfigs()
            } else {
                toast.error(data.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Không thể lưu cấu hình")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
            {/* Header section - Clean & Professional */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu hình Giao diện</h1>
                <p className="text-slate-500 text-base mt-2">
                    Quản lý nội dung hiển thị trên trang chủ và chân trang.
                </p>
            </div>

            {/* Navigation Tabs - Simple Bordered */}
            <div className="border-b border-slate-200 mb-8">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("home")}
                        className={cn(
                            "pb-4 text-sm font-medium transition-all relative",
                            activeTab === "home"
                                ? "text-blue-600 font-bold"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Trang chủ
                        {activeTab === "home" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("footer")}
                        className={cn(
                            "pb-4 text-sm font-medium transition-all relative",
                            activeTab === "footer"
                                ? "text-blue-600 font-bold"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Chân trang
                        {activeTab === "footer" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="pb-20">
                {activeTab === "home" ? (
                    <div className="space-y-10">
                        {/* 1. Quick Search Section - With Visual Guide */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                                <h2 className="text-lg font-bold text-slate-800">Tìm kiếm nhanh (Hot Tags)</h2>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Form */}
                                <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden h-fit">
                                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Nội dung hiển thị</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-bold">1</Badge>
                                                <label className="text-sm font-medium text-slate-700">Tiêu đề chính</label>
                                            </div>
                                            <Input
                                                value={quickSearch?.title}
                                                onChange={(e) => setQuickSearch({ ...quickSearch, title: e.target.value })}
                                                className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-bold">2</Badge>
                                                <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
                                            </div>
                                            <Textarea
                                                value={quickSearch?.description}
                                                onChange={(e) => setQuickSearch({ ...quickSearch, description: e.target.value })}
                                                className="min-h-[100px] text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px] font-bold">3</Badge>
                                                <label className="text-sm font-medium text-slate-700">Từ khóa nổi bật (cách nhau dấu phẩy)</label>
                                            </div>
                                            <Input
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="#Tag1, #Tag2..."
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleSave("quickSearch")}
                                            disabled={saving}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        >
                                            <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Guide Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Minh họa trực quan</span>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                        <img
                                            src="/admin/search-guide.png"
                                            alt="Visual Guide"
                                            className="w-full h-auto"
                                        />
                                        {/* Markers */}
                                        <div className="absolute top-[28%] left-[15%] w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">1</div>
                                        <div className="absolute top-[55%] left-[20%] w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">2</div>
                                        <div className="absolute top-[82%] left-[45%] w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">3</div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">
                                        * Các số 1, 2, 3 tương ứng với các trường nhập liệu bên trái.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : (
                    /* Footer Tab - Clean & Organized */
                    <div className="space-y-8">
                        {/* Brand Info */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-slate-500" />
                                Thông tin Thương hiệu
                            </h2>
                            <Card className="shadow-sm border-slate-200 rounded-xl">
                                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Tên Trung tâm</label>
                                        <Input
                                            value={footerConfig?.centerName}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, centerName: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Giới thiệu ngắn</label>
                                        <Textarea
                                            value={footerConfig?.brandDescription}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, brandDescription: e.target.value })}
                                            className="min-h-[100px] text-sm resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Contact Details */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Info className="w-5 h-5 text-slate-500" />
                                Thông tin Liên hệ
                            </h2>
                            <Card className="shadow-sm border-slate-200 rounded-xl">
                                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                                        <Input
                                            value={footerConfig?.address}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, address: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Email</label>
                                        <Input
                                            value={footerConfig?.email}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, email: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Facebook URL</label>
                                        <Input
                                            value={footerConfig?.facebook}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, facebook: e.target.value })}
                                            className="h-10 text-sm font-mono text-slate-600"
                                        />
                                    </div>

                                    <div className="md:col-span-2 pt-4 flex justify-end">
                                        <Button
                                            onClick={() => handleSave("footer")}
                                            disabled={saving}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8"
                                        >
                                            <Save className="w-4 h-4 mr-2" /> Lưu cấu hình chân trang
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}
