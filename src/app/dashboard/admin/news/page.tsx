"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Newspaper, TrendingUp, Calendar, Eye, ExternalLink, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { News } from "@/types"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const CATEGORIES = ["Thị trường", "Công nghệ", "Việc làm", "Kỹ năng", "Cẩm nang", "Định hướng", "Góc nhìn", "Thông báo", "Video", "Quote"]

export default function AdminNewsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentNews, setCurrentNews] = useState<Partial<News>>({
        title: "",
        summary: "",
        content: "",
        category: CATEGORIES[0],
        sourceName: "GDU Research",
        sourceUrl: "#",
        imageUrl: "",
        gallery: [],
        videoUrls: [],
        relatedLinks: [],
        tags: [],
        isFeatured: false,
        readingTime: "5 phút",
    })
    const { toast } = useToast()
    const [isQuickPostOpen, setIsQuickPostOpen] = useState(false)
    const [quickPostUrl, setQuickPostUrl] = useState("")
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)

    const handleQuickPost = async () => {
        if (!quickPostUrl) {
            toast({ title: "Thiếu URL", description: "Vui lòng nhập URL bài viết", variant: "destructive" })
            return
        }

        setIsFetchingMetadata(true)
        try {
            const res = await fetch("/api/news/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: quickPostUrl }),
            })
            const result = await res.json()

            if (result.success) {
                const metadata = result.data
                setIsEditing(false)
                setCurrentNews({
                    title: metadata.title || "",
                    summary: metadata.description || "",
                    content: "", // Content still needs to be filled manually or from description
                    category: CATEGORIES[0],
                    sourceName: metadata.sourceName || "GDU Research",
                    sourceUrl: quickPostUrl,
                    imageUrl: metadata.image || "",
                    gallery: [],
                    videoUrls: [],
                    relatedLinks: [],
                    tags: [],
                    isFeatured: false,
                    readingTime: "5 phút",
                })
                setIsQuickPostOpen(false)
                setIsDialogOpen(true)
                setQuickPostUrl("")
                toast({ title: "Lấy thông tin thành công", description: "Vui lòng kiểm tra và bổ sung nội dung bài viết." })
            } else {
                toast({ title: "Lỗi", description: result.error || "Không thể lấy thông tin từ URL này", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra khi kết nối máy chủ", variant: "destructive" })
        } finally {
            setIsFetchingMetadata(false)
        }
    }

    // Helper to add/remove items from arrays
    const handleArrayChange = (field: keyof News, index: number, value: string) => {
        const arr = [...(currentNews[field] as any[])]
        arr[index] = value
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const addItem = (field: keyof News, defaultValue: any = "") => {
        const arr = [...(currentNews[field] as any[] || []), defaultValue]
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const removeItem = (field: keyof News, index: number) => {
        const arr = [...(currentNews[field] as any[])]
        arr.splice(index, 1)
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const handleLinkChange = (index: number, field: "title" | "url", value: string) => {
        const links = [...(currentNews.relatedLinks || [])]
        links[index] = { ...links[index], [field]: value }
        setCurrentNews({ ...currentNews, relatedLinks: links })
    }

    const fetchNews = async () => {
        if (user?.role !== "admin") return // Unauthorized
        setLoading(true)
        try {
            const res = await fetch("/api/news?limit=100")
            const result = await res.json()
            if (result.success) {
                setNews(result.data)
            }
        } catch (error) {
            console.error("Fetch news error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading && user?.role !== "admin") {
            router.push("/dashboard")
            return
        }
        fetchNews()

        // Check for quick post metadata from global actions
        const quickMetadata = sessionStorage.getItem("quick_post_metadata")
        if (quickMetadata) {
            try {
                const metadata = JSON.parse(quickMetadata)
                setIsEditing(false)
                setCurrentNews({
                    title: metadata.title || "",
                    summary: metadata.description || "",
                    content: "",
                    category: CATEGORIES[0],
                    sourceName: metadata.sourceName || "GDU Research",
                    sourceUrl: metadata.sourceUrl || "#",
                    imageUrl: metadata.image || "",
                    gallery: [],
                    videoUrls: [],
                    relatedLinks: [],
                    tags: [],
                    isFeatured: false,
                    readingTime: "5 phút",
                })
                setIsDialogOpen(true)
                sessionStorage.removeItem("quick_post_metadata")
                toast({ title: "Đã nạp thông tin", description: "Vui lòng hoàn tất nội dung bài viết." })
            } catch (e) {
                console.error("Error parsing quick metadata:", e)
            }
        }
    }, [user, authLoading])

    const handleSave = async () => {
        if (user?.role !== "admin") {
            toast({ title: "Từ chối", description: "Bạn không có quyền đăng tin", variant: "destructive" })
            return
        }
        if (!currentNews.title || !currentNews.summary || !currentNews.content) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng điền các trường bắt buộc", variant: "destructive" })
            return
        }

        try {
            const method = isEditing ? "PATCH" : "POST"
            const res = await fetch("/api/news", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentNews),
            })

            const result = await res.json()
            if (result.success) {
                toast({ title: isEditing ? "Cập nhật thành công" : "Đăng tin thành công" })
                setIsDialogOpen(false)
                fetchNews()
                setCurrentNews({
                    title: "",
                    summary: "",
                    content: "",
                    category: CATEGORIES[0],
                    sourceName: "GDU Research",
                    sourceUrl: "#",
                    imageUrl: "",
                    gallery: [],
                    videoUrls: [],
                    relatedLinks: [],
                    tags: [],
                    isFeatured: false,
                    readingTime: "5 phút",
                })
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu bài viết", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        if (user?.role !== "admin") {
            toast({ title: "Từ chối", description: "Chỉ Admin mới có quyền xóa", variant: "destructive" })
            return
        }
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return

        try {
            const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast({ title: "Đã xóa tin tức" })
                fetchNews()
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa bài viết", variant: "destructive" })
        }
    }

    const [selectedSource, setSelectedSource] = useState<string | null>(null)

    const filteredNews = news.filter(item =>
        (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sourceName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedSource || item.sourceName === selectedSource)
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Hệ thống Quản lý Tin tức</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Đăng tải và điều phối các bài phân tích, xu hướng thị trường lao động cho sinh viên.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsQuickPostOpen(true)}
                        className="h-14 px-6 rounded-2xl gap-3 border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Zap className="w-5 h-5" /> Quick Post
                    </Button>
                    <Button onClick={() => {
                        setIsEditing(false)
                        setCurrentNews({
                            title: "",
                            summary: "",
                            content: "",
                            category: CATEGORIES[0],
                            sourceName: "GDU Research",
                            sourceUrl: "#",
                            imageUrl: "",
                            gallery: [],
                            videoUrls: [],
                            relatedLinks: [],
                            tags: [],
                            isFeatured: false,
                            readingTime: "5 phút",
                        })
                        setIsDialogOpen(true)
                    }} className="h-14 px-8 rounded-2xl gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                        <Plus className="w-5 h-5" /> Đăng bài viết mới
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar/Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[24px] border-border/40 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Bộ lọc nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Tìm theo tiêu đề..."
                                    className="pl-9 h-11 rounded-xl bg-muted/20 border-border/40 focus:ring-primary/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Theo nguồn tin</Label>
                                    {selectedSource && (
                                        <button
                                            onClick={() => setSelectedSource(null)}
                                            className="text-[10px] text-red-500 font-bold hover:underline"
                                        >
                                            Xóa lọc
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {["VietnamWorks", "TopCV", "GDU Research"].map(s => (
                                        <Button
                                            key={s}
                                            variant={selectedSource === s ? "default" : "ghost"}
                                            onClick={() => setSelectedSource(selectedSource === s ? null : s)}
                                            className={`justify-start gap-2 h-10 rounded-lg font-medium text-sm px-3 ${selectedSource === s
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                : "hover:bg-primary/5 hover:text-primary"
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedSource === s ? "bg-white" : "bg-border"}`} />
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[24px] border-border/40 overflow-hidden bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-2xl font-black leading-none">{news.length}</div>
                            </div>
                            <div className="text-sm font-bold opacity-80">Tổng số bài viết hiện có trên hệ thống</div>
                        </CardContent>
                    </Card>
                </div>

                {/* News List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-muted/10 rounded-[40px] border-2 border-dashed border-border/40">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Đang tải danh sách bài viết...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredNews.map((item) => (
                                <Card key={item._id} className="overflow-hidden group flex flex-col rounded-[28px] border-border/40 hover:shadow-xl transition-all duration-300">
                                    <div className="relative h-44 bg-muted overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Newspaper className="w-16 h-16 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black text-white rounded-full uppercase tracking-widest border border-white/10">
                                                {item.category}
                                            </span>
                                        </div>
                                        {/* Quick Actions Overlay */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col gap-2">
                                                <Button size="icon" className="h-8 w-8 rounded-full bg-white text-zinc-900 hover:bg-white/90" onClick={() => {
                                                    setIsEditing(true)
                                                    setCurrentNews(item)
                                                    setIsDialogOpen(true)
                                                }}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(item._id!)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {item.views} views
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                                            {item.summary}
                                        </p>
                                        <div className="mt-auto pt-5 border-t border-border/40 flex items-center justify-between">
                                            <div className="px-3 py-1 bg-muted/40 rounded-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {item.sourceName}
                                            </div>
                                            <a href={item.sourceUrl} target="_blank" className="text-[11px] font-black text-primary hover:underline flex items-center gap-1">
                                                Link nguồn <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post/Edit Dialog - Professional Redesign */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Chỉnh sửa bài viết" : "Đăng tin tức mới"}</DialogTitle>
                        <DialogDescription>
                            Điền đầy đủ thông tin bên dưới để chia sẻ tin tức đến sinh viên.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={currentNews.title}
                                onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                                placeholder="Tiêu đề bài viết"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Chuyên mục <span className="text-red-500">*</span></Label>
                                <Select
                                    value={currentNews.category}
                                    onValueChange={(val) => setCurrentNews({ ...currentNews, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn chuyên mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="source">Nguồn tin <span className="text-red-500">*</span></Label>
                                <Input
                                    id="source"
                                    value={currentNews.sourceName}
                                    onChange={(e) => setCurrentNews({ ...currentNews, sourceName: e.target.value })}
                                    placeholder="Tên nguồn (VD: VietnamWorks)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="readingTime">Thời gian đọc</Label>
                                <Input
                                    id="readingTime"
                                    value={currentNews.readingTime}
                                    onChange={(e) => setCurrentNews({ ...currentNews, readingTime: e.target.value })}
                                    placeholder="VD: 5 phút"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags (cách nhau bằng dấu phẩy)</Label>
                                <Input
                                    id="tags"
                                    value={currentNews.tags?.join(", ")}
                                    onChange={(e) => setCurrentNews({ ...currentNews, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "") })}
                                    placeholder="Xu hướng, Công nghệ..."
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sourceUrl">Link nguồn bài viết</Label>
                            <Input
                                id="sourceUrl"
                                value={currentNews.sourceUrl}
                                onChange={(e) => setCurrentNews({ ...currentNews, sourceUrl: e.target.value })}
                                placeholder="URL đầy đủ"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="imageUrl">Link ảnh đại diện</Label>
                            <Input
                                id="imageUrl"
                                value={currentNews.imageUrl}
                                onChange={(e) => setCurrentNews({ ...currentNews, imageUrl: e.target.value })}
                                placeholder="URL ảnh chính"
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Bộ sưu tập ảnh (Gallery)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('gallery')}>
                                    Thêm ảnh
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {currentNews.gallery?.map((url, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => handleArrayChange('gallery', idx, e.target.value)}
                                            placeholder="Link ảnh"
                                        />
                                        <Button size="icon" variant="destructive" onClick={() => removeItem('gallery', idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Videos (URL)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('videoUrls')}>
                                    Thêm video
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {currentNews.videoUrls?.map((url, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => handleArrayChange('videoUrls', idx, e.target.value)}
                                            placeholder="YouTube link"
                                        />
                                        <Button size="icon" variant="destructive" onClick={() => removeItem('videoUrls', idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Liên kết liên quan</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => addItem('relatedLinks', { title: "", url: "" })}>
                                    Thêm link
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {currentNews.relatedLinks?.map((link, idx) => (
                                    <div key={idx} className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg relative">
                                        <Input
                                            value={link.title}
                                            onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                                            placeholder="Tiêu đề link"
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                value={link.url}
                                                onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                                                placeholder="URL"
                                            />
                                            <Button size="icon" variant="destructive" onClick={() => removeItem('relatedLinks', idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="summary">Tóm tắt ngắn <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="summary"
                                value={currentNews.summary}
                                onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                                placeholder="Viết một đoạn ngắn giới thiệu bài viết"
                                className="h-20"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Nội dung chi tiết <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="content"
                                value={currentNews.content}
                                onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                                placeholder="Nội dung chính của bài viết"
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="featured"
                                checked={currentNews.isFeatured}
                                onCheckedChange={(val) => setCurrentNews({ ...currentNews, isFeatured: val })}
                            />
                            <Label htmlFor="featured">Đặt làm bài viết nổi bật</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isEditing ? "Cập nhật" : "Đăng tin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Quick Post Dialog */}
            <Dialog open={isQuickPostOpen} onOpenChange={setIsQuickPostOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Quick Post News
                        </DialogTitle>
                        <DialogDescription>
                            Dán link bài báo vào đây, hệ thống sẽ tự động lấy tiêu đề, ảnh và mô tả.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quick-url">Link bài báo (URL)</Label>
                            <Input
                                id="quick-url"
                                placeholder="https://..."
                                value={quickPostUrl}
                                onChange={(e) => setQuickPostUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickPost()
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsQuickPostOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleQuickPost}
                            disabled={isFetchingMetadata}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                        >
                            {isFetchingMetadata ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lấy...
                                </>
                            ) : (
                                "Tiếp tục"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
