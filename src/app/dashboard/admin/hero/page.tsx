"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, Image as ImageIcon, Eye, EyeOff, Layout, MousePointer2, Settings2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface HeroSlide {
    _id?: string
    title: string
    subtitle: string
    image: string
    cta: string
    link: string
    order: number
    isActive: boolean
    page: string
}

const PAGES = [
    { id: "home", name: "Trang chủ", description: "Banner xoay (Carousel) ở đầu trang chủ" },
    { id: "jobs", name: "Trang việc làm", description: "Ảnh nền tiêu đề trang danh sách việc làm" },
    { id: "companies", name: "Trang doanh nghiệp", description: "Ảnh nền tiêu đề trang danh sách doanh nghiệp" },
    { id: "news", name: "Trang tin tức", description: "Ảnh nền tiêu đề trang tin tức" },
    { id: "contact", name: "Trang liên hệ", description: "Ảnh nền tiêu đề trang liên hệ" },
]

export default function AdminHeroPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("home")
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const resAll = await fetch("/api/hero-slides?page=all")
            const data = await resAll.json()
            if (data.success) {
                setSlides(data.data)
            }
        } catch (error) {
            toast.error("Không thể tải danh sách slide")
        } finally {
            setLoading(false)
        }
    }

    const refreshData = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/hero-slides?page=all")
            const data = await res.json()
            if (data.success) setSlides(data.data)
        } catch (e) {
            toast.error("Lỗi cập nhật dữ liệu")
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            if (editingSlide) {
                setEditingSlide({ ...editingSlide, image: reader.result as string })
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        if (!editingSlide) return

        try {
            const res = await fetch("/api/admin/hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingSlide._id,
                    ...editingSlide
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(editingSlide._id ? "Đã cập nhật slide" : "Đã tạo slide mới")
                setEditingSlide(null)
                refreshData()
            } else {
                toast.error(data.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Không thể lưu slide")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa slide này?")) return

        try {
            const res = await fetch(`/api/admin/hero-slides?id=${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                toast.success("Đã xóa slide")
                refreshData()
            }
        } catch (error) {
            toast.error("Không thể xóa slide")
        }
    }

    const handleToggleActive = async (slide: HeroSlide) => {
        try {
            const res = await fetch("/api/admin/hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: slide._id,
                    ...slide,
                    isActive: !slide.isActive
                })
            })
            if (res.ok) {
                refreshData()
            }
        } catch (error) {
            toast.error("Không thể thay đổi trạng thái")
        }
    }

    const handleImportDefaults = async () => {
        if (!confirm("Bạn có muốn nhập dữ liệu mặc định (3 ảnh gốc của trang chủ) không?")) return
        setLoading(true)
        try {
            const res = await fetch("/api/admin/hero-slides/import", { method: "POST" })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
                refreshData()
            }
        } catch (e) {
            toast.error("Lỗi khi nhập dữ liệu")
        } finally {
            setLoading(false)
        }
    }

    const filteredSlides = slides.filter(s => s.page === activeTab)
    const currentPageInfo = PAGES.find(p => p.id === activeTab)

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header section - Updated to GDU Colors */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e293b] to-[#004fa3] p-8 lg:p-12 mb-8 text-white shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                        <Layout className="w-10 h-10 text-yellow-400" />
                        Quản lý Banner & Giao diện
                    </h1>
                    <p className="text-white/80 text-lg">
                        Tùy chỉnh hình nền, tiêu đề và nút bấm cho từng chuyên mục trên website. Giúp trang web luôn mới mẻ và đúng nhận diện thương hiệu.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Page Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {PAGES.map((page) => (
                    <button
                        key={page.id}
                        onClick={() => setActiveTab(page.id)}
                        className={cn(
                            "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2",
                            activeTab === page.id
                                ? "bg-white text-[#1e293b] shadow-md"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                        )}
                    >
                        {page.name}
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            activeTab === page.id ? "bg-[#1e293b] text-white" : "bg-slate-200 text-slate-500"
                        )}>
                            {slides.filter(s => s.page === page.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Danh sách thiết kế cho {currentPageInfo?.name}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Info className="w-4 h-4" />
                        {currentPageInfo?.description}
                    </div>
                </div>
                <Button
                    onClick={() => setEditingSlide({
                        title: "",
                        subtitle: "",
                        image: "",
                        cta: "Khám phá ngay",
                        link: "/jobs",
                        order: filteredSlides.length,
                        isActive: true,
                        page: activeTab
                    })}
                    className="bg-[#1e293b] hover:bg-[#1e293b]/90 shadow-lg shadow-[#1e293b]/20 px-6 py-6 rounded-xl text-lg h-auto"
                >
                    <Plus className="w-5 h-5 mr-2" /> Thêm thiết kế mới
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />)}
                </div>
            ) : filteredSlides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSlides.map((slide) => (
                        <div key={slide._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200 overflow-hidden flex flex-col">
                            <div className="relative h-48 overflow-hidden bg-slate-50">
                                {slide.image ? (
                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <div className="flex gap-2 w-full justify-between items-center">
                                        <span className="text-white text-xs font-medium">Preview thiết kế v1.0</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingSlide(slide)}
                                                className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-lg text-white transition-colors"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => slide._id && handleDelete(slide._id)}
                                                className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md p-2 rounded-lg text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Order Badge */}
                                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-white/20">
                                    Vị trí: {slide.order + 1}
                                </div>
                                {/* Active Toggle UI */}
                                <button
                                    onClick={() => handleToggleActive(slide)}
                                    className={cn(
                                        "absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5",
                                        slide.isActive ? "bg-green-500 text-white" : "bg-slate-500 text-white"
                                    )}
                                >
                                    {slide.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {slide.isActive ? "Đang hiện" : "Đang ẩn"}
                                </button>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-[#1e293b] transition-colors line-clamp-1">
                                    {slide.title || "Chưa đặt tiêu đề"}
                                </h3>
                                <p className="text-slate-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                                    {slide.subtitle || "Không có phụ đề hiển thị."}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MousePointer2 className="w-4 h-4" />
                                        <span className="text-xs font-medium">{slide.cta}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingSlide(slide)}
                                        className="text-[#1e293b] font-bold hover:bg-[#1e293b]/10"
                                    >
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center px-4">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Chưa có thiết kế nào cho trang này</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Bạn chưa thiết lập bất kỳ hình ảnh nào cho mục <strong>{currentPageInfo?.name}</strong>. Hãy nhấn nút bên dưới để bắt đầu hoặc nhập dữ liệu mặc định từ hệ thống.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={() => setEditingSlide({
                                title: "",
                                subtitle: "",
                                image: "",
                                cta: "Khám phá ngay",
                                link: "/jobs",
                                order: 0,
                                isActive: true,
                                page: activeTab
                            })}
                            className="bg-[#1e293b] hover:bg-[#1e293b]/90 px-8 py-6 rounded-xl h-auto font-bold text-lg"
                        >
                            <Plus className="w-5 h-5 mr-1.5" /> Thêm Slide {currentPageInfo?.name}
                        </Button>

                        {activeTab === "home" && (
                            <Button
                                variant="outline"
                                onClick={handleImportDefaults}
                                className="border-2 border-[#1e293b] text-[#1e293b] hover:bg-slate-50 px-8 py-6 rounded-xl h-auto font-bold text-lg"
                            >
                                <ImageIcon className="w-5 h-5 mr-1.5" /> Nhập dữ liệu mặc định
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Editor Modal */}
            {editingSlide && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/5 animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1e293b]">
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 leading-none">
                                        {editingSlide._id ? "Cập nhật thiết kế" : "Tạo thiết kế mới"}
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1.5">Vị trí hiển thị: <span className="font-bold text-[#1e293b]">{PAGES.find(p => p.id === editingSlide.page)?.name}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingSlide(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors shadow-sm ring-1 ring-slate-200"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Left side: Image & Text Fields */}
                                <div className="space-y-8">
                                    {/* Image Section */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Hình ảnh nền thiết kế
                                            <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-wider">Khuyên dùng: 1920x1080</span>
                                        </label>
                                        <div
                                            className="group relative border-2 border-dashed border-slate-200 rounded-[1.5rem] p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-[#1e293b] hover:shadow-xl hover:shadow-[#1e293b]/5 transition-all duration-500 cursor-pointer min-h-[220px]"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            {editingSlide.image ? (
                                                <div className="relative w-full h-full min-h-[188px]">
                                                    <img src={editingSlide.image} className="absolute inset-0 w-full h-full object-cover rounded-[1rem] shadow-sm" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-[1rem] transition-opacity flex items-center justify-center">
                                                        <span className="bg-white px-4 py-2 rounded-xl text-slate-800 font-bold text-sm">Thay đổi hình ảnh</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-8 h-8 text-[#1e293b]" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">Tải ảnh lên hệ thống</p>
                                                    <p className="text-xs text-slate-400 mt-1">Dung lượng tối đa 2MB</p>
                                                </>
                                            )}
                                            <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                    </div>

                                    {/* Text Fields (Left Column) */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Tiêu đề (H1/H2)</label>
                                            <Input
                                                value={editingSlide.title}
                                                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                                className="rounded-xl border-slate-200 h-12 focus:ring-[#1e293b]"
                                                placeholder="VD: Gia Định University - Nâng tầm trí tuệ"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Mô tả ngắn (Subtitle)</label>
                                            <Textarea
                                                value={editingSlide.subtitle}
                                                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                                                className="rounded-xl border-slate-200 min-h-[80px] focus:ring-[#1e293b] resize-none"
                                                placeholder="Nhập nội dung mô tả hiển thị dưới tiêu đề chính..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Controls & Preview */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Order & Status */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Thứ tự hiển thị</label>
                                            <Select
                                                value={editingSlide.order.toString()}
                                                onValueChange={(val) => setEditingSlide({ ...editingSlide, order: parseInt(val) })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 h-12 shadow-none focus:ring-[#1e293b]">
                                                    <SelectValue placeholder="Chọn vị trí" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                    {Array.from({ length: editingSlide.page === "home" ? 3 : 1 }).map((_, idx) => (
                                                        <SelectItem key={idx} value={idx.toString()} className="rounded-lg">
                                                            Vị trí {idx + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className={cn("space-y-2", editingSlide.page !== "home" && "col-span-2")}>
                                            <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                                            <div className="flex items-center gap-3 h-12 bg-slate-50 rounded-xl px-4 border border-slate-200">
                                                <button
                                                    onClick={() => setEditingSlide({ ...editingSlide, isActive: !editingSlide.isActive })}
                                                    className={cn(
                                                        "flex items-center gap-2 text-sm font-bold transition-colors w-full",
                                                        editingSlide.isActive ? "text-green-600" : "text-slate-400"
                                                    )}
                                                >
                                                    {editingSlide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    {editingSlide.isActive ? "Đang hiển thị" : "Đang ẩn"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Buttons (Home only) */}
                                    {editingSlide.page === "home" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Tên nút (Button)</label>
                                                <Input
                                                    value={editingSlide.cta}
                                                    onChange={(e) => setEditingSlide({ ...editingSlide, cta: e.target.value })}
                                                    className="rounded-xl border-slate-200 h-12 shadow-sm focus:ring-[#1e293b]"
                                                    placeholder="Tìm hiểu ngay"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Link điều hướng</label>
                                                <Input
                                                    value={editingSlide.link}
                                                    onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                                                    className="rounded-xl border-slate-200 h-12 shadow-sm focus:ring-[#1e293b]"
                                                    placeholder="/jobs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Preview */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Preview trực quan (Live)
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        </label>
                                        <div className={cn(
                                            "rounded-[1.5rem] bg-slate-900 overflow-hidden relative shadow-inner ring-1 ring-black/10 transition-all duration-500",
                                            editingSlide.page === "home" ? "aspect-video" : "aspect-[21/9]"
                                        )}>
                                            {editingSlide.image ? (
                                                <>
                                                    <img src={editingSlide.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                                    <div className={cn(
                                                        "absolute inset-0 text-white flex flex-col px-8",
                                                        editingSlide.page === "home" ? "justify-center items-start text-left" : "justify-end pb-4 items-start text-left"
                                                    )}>
                                                        <h4 className={cn(
                                                            "font-bold leading-tight line-clamp-2 transition-all duration-500",
                                                            editingSlide.page === "home" ? "text-xl" : "text-lg"
                                                        )}>
                                                            {editingSlide.title || "TIÊU ĐỀ PREVIEW"}
                                                        </h4>
                                                        <p className="text-[10px] text-white/70 mt-1.5 line-clamp-2 max-w-[90%]">
                                                            {editingSlide.subtitle || "Nội dung mô tả sẽ hiển thị ở đây..."}
                                                        </p>
                                                        {editingSlide.page === "home" && editingSlide.cta && (
                                                            <div className="mt-3 inline-block bg-[#1e293b] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                                                {editingSlide.cta}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold text-sm bg-slate-100/50">
                                                    Vui lòng tải ảnh để xem preview
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingSlide(null)}
                                className="rounded-xl font-bold px-6 h-12"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-[#1e293b] hover:bg-[#1e293b]/90 shadow-lg shadow-[#1e293b]/20 rounded-xl font-bold px-8 h-12"
                            >
                                <Save className="w-5 h-5 mr-2" /> Lưu thiết kế
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
