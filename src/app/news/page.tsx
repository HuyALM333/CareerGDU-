"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { News } from "@/types"
import { NewsCard } from "@/components/home/news-card"
import { TrendingUp, Search, Filter, Newspaper, ArrowRight, ArrowUpRight, ExternalLink, RefreshCw, ArrowLeft, Mail, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { CategorySection } from "@/components/news/category-section"
import { HeroGrid } from "@/components/news/hero-grid"
import { NewsSidebar } from "@/components/news/news-sidebar"
import { BannerQuote } from "@/components/news/banner-quote"
import { VideoSection } from "@/components/news/video-section"

const CATEGORIES = [
    "Tất cả",
    "Thị trường",
    "Công nghệ",
    "Việc làm",
    "Kỹ năng",
    "Cẩm nang",
    "Định hướng",
    "Góc nhìn",
    "Thông báo"
]



export default function NewsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <NewsPageContent />
        </Suspense>
    )
}

function NewsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlCategory = searchParams.get("category")

    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState(urlCategory || "Tất cả")
    const [sortBy, setSortBy] = useState("newest")

    // States for specialized categories
    const [partnerNews, setPartnerNews] = useState<News[]>([])
    const [careerHackNews, setCareerHackNews] = useState<News[]>([])
    const [opportunityNews, setOpportunityNews] = useState<News[]>([])
    const [quoteNews, setQuoteNews] = useState<News | null>(null)
    const [videoNews, setVideoNews] = useState<News[]>([])

    const fetchNews = async () => {
        setLoading(true)
        try {
            const catParam = category !== "Tất cả" ? `&category=${category}` : ""
            const response = await fetch(`/api/news?limit=50${catParam}`)
            const result = await response.json()
            if (result.success) {
                setNews(result.data)
            }
        } catch (error) {
            console.error("Error fetching news:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSpecializedNews = async () => {
        try {
            // Fetch Partner News (Market category)
            const pRes = await fetch(`/api/news?limit=10&category=Thị trường`)
            const pData = await pRes.json()
            if (pData.success && pData.data.length > 0) {
                setPartnerNews(pData.data)
            } else {
                // Fallback to latest news if empty
                const pFallback = await fetch(`/api/news?limit=10`)
                const pfData = await pFallback.json()
                if (pfData.success) setPartnerNews(pfData.data)
            }

            // Fetch Career Hacks & Talk (Skills category)
            const cRes = await fetch(`/api/news?limit=10&category=Kỹ năng`)
            const cData = await cRes.json()
            if (cData.success && cData.data.length > 0) {
                setCareerHackNews(cData.data)
            } else {
                const cFallback = await fetch(`/api/news?limit=10`)
                const cfData = await cFallback.json()
                if (cfData.success) setCareerHackNews(cfData.data)
            }

            // Fetch Internships & Contests (Notifications category)
            const oRes = await fetch(`/api/news?limit=10&category=Thông báo`)
            const oData = await oRes.json()
            if (oData.success && oData.data.length > 0) {
                setOpportunityNews(oData.data)
            } else {
                const oFallback = await fetch(`/api/news?limit=10`)
                const ofData = await oFallback.json()
                if (ofData.success) setOpportunityNews(ofData.data)
            }

            // Fetch Quote
            const qRes = await fetch(`/api/news?limit=1&category=Quote`)
            const qData = await qRes.json()
            if (qData.success && qData.data.length > 0) {
                setQuoteNews(qData.data[0])
            }

            // Fetch Videos
            const vRes = await fetch(`/api/news?limit=3&category=Video`)
            const vData = await vRes.json()
            if (vData.success && vData.data.length > 0) {
                setVideoNews(vData.data)
            }
        } catch (error) {
            console.error("Error fetching specialized news:", error)
        }
    }

    const [banner, setBanner] = useState<any>(null)

    const fetchBanner = async () => {
        try {
            const res = await fetch('/api/hero-slides?page=news')
            const data = await res.json()
            if (data.success && data.data.length > 0) {
                setBanner(data.data[0])
            }
        } catch (error) {
            console.error("Error fetching news banner:", error)
        }
    }

    useEffect(() => {
        fetchNews()
        fetchSpecializedNews()
        fetchBanner()
    }, [category])

    // Sync with URL category
    useEffect(() => {
        if (urlCategory && urlCategory !== category) {
            setCategory(urlCategory)

            // Smooth scroll to results when category changes via URL
            setTimeout(() => {
                const element = document.getElementById('results-section');
                if (element) {
                    const headerOffset = 180;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [urlCategory])

    const filteredAndSortedNews = news
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            if (sortBy === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
            if (sortBy === "popular") return b.views - a.views
            return 0
        })

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <main>
                {/* Blue Hero Header */}
                <div className="relative min-h-[85vh] overflow-hidden flex flex-col justify-end pb-16 lg:pb-24">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                        style={{ backgroundImage: `url('${banner?.image || '/hero-bg.png'}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20" />

                    <div className="w-full px-4 md:px-10 lg:px-20 relative z-10">
                        <div className="max-w-5xl">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                                {banner?.title || (
                                    <>
                                        Tin tức & Phân tích <br />Thị trường Lao động
                                    </>
                                )}
                            </h1>
                            <p className="text-xl md:text-2xl lg:text-3xl text-white mb-6 drop-shadow-md font-medium max-w-3xl">
                                {banner?.subtitle || "Cập nhật xu hướng tuyển dụng, báo cáo thị trường và kiến thức phát triển sự nghiệp từ đội ngũ chuyên gia GDU."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* News Hero Grid Section */}
                <div className="bg-white">
                    {news.length > 0 && <HeroGrid featuredNews={news.slice(0, 3)} />}
                </div>

                {/* News Search & Filter Section */}
                <div className="bg-white border-y border-slate-100 sticky top-[112px] lg:top-[128px] z-40 backdrop-blur-md bg-white/90">
                    <div className="w-full px-4 md:px-10 lg:px-20 py-6">
                        <div className="flex flex-col gap-6">
                            {/* Categories Row */}
                            <div className="flex flex-wrap items-center gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${category === cat
                                            ? "bg-[#0A2647] text-white shadow-md shadow-blue-900/20"
                                            : "bg-white text-slate-600 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Sort Row */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
                                <div className="relative w-full max-w-lg">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm nội dung bài viết..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="px-5 py-2.5 bg-white border border-slate-100 rounded-full flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors">
                                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    Sắp xếp: {sortBy === "newest" ? "Mới nhất" : sortBy === "oldest" ? "Cũ nhất" : "Xem nhiều"}
                                                    <ChevronDown className="w-3 h-3" />
                                                </span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2">
                                            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                                <DropdownMenuRadioItem value="newest" className="rounded-xl cursor-pointer">Mới nhất</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="oldest" className="rounded-xl cursor-pointer">Cũ nhất</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="popular" className="rounded-xl cursor-pointer">Xem nhiều nhất</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <button
                                        onClick={() => {
                                            setCategory("Tất cả")
                                            setSearchQuery("")
                                            fetchNews()
                                        }}
                                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border border-slate-100 shadow-sm"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full px-4 md:px-10 lg:px-20 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content Area */}
                        <div className="lg:col-span-8 min-h-[800px]">
                            <div id="results-section" className="flex items-center justify-between mb-8 pb-4 scroll-mt-48/72">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-[#0A2647]">Bài viết mới nhất</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="animate-pulse flex flex-col gap-6">
                                            <div className="aspect-[16/10] bg-slate-100 rounded-[32px]" />
                                            <div className="space-y-4">
                                                <div className="h-4 bg-slate-100 rounded w-1/4" />
                                                <div className="h-8 bg-slate-100 rounded w-full" />
                                                <div className="h-20 bg-slate-100 rounded w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAndSortedNews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                                    {filteredAndSortedNews.map((item) => (
                                        <NewsCard key={item._id} news={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Không tìm thấy bài viết nào.</p>
                                </div>
                            )}

                            {/* Load More */}
                            {filteredAndSortedNews.length >= 10 && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={() => fetchNews()}
                                        className="h-14 px-12 rounded-full border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-primary hover:text-white transition-all uppercase tracking-[0.2em] bg-white"
                                    >
                                        XEM THÊM BÀI VIẾT
                                        <ArrowRight className="inline-block ml-3 w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Area */}
                        <div className="lg:col-span-4">
                            <NewsSidebar onTagClick={(tag) => {
                                setSearchQuery(tag);
                                // Use a slightly longer timeout to allow for DOM settles
                                setTimeout(() => {
                                    const element = document.getElementById('results-section');
                                    if (element) {
                                        const headerOffset = 180; // Buffer for sticky header
                                        const elementPosition = element.getBoundingClientRect().top;
                                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                }, 300);
                            }} />
                        </div>
                    </div>
                </div>

                {/* Premium Banner Quote Section */}
                <BannerQuote news={quoteNews || undefined} />

                {/* Professional Sections Replacement */}
                <div className="space-y-0">
                    <CategorySection
                        title="Góc Đối Tác"
                        description="Tin tức, báo cáo và cơ hội từ các đối tác chiến lược của GDU."
                        news={partnerNews}
                        viewAllHref="/news?category=Thị trường"
                    />

                    <CategorySection
                        title="Cẩm Nang Bứt Phá"
                        description="Bí kíp săn job, rèn luyện kỹ năng và câu chuyện từ những người đi trước."
                        news={careerHackNews}
                        viewAllHref="/news?category=Kỹ năng"
                    />

                    <CategorySection
                        title="Trạm Cơ Hội"
                        description="Học bổng, cuộc thi và các chương trình thực tập hấp dẫn dành riêng cho sinh viên."
                        news={opportunityNews}
                        viewAllHref="/news?category=Thông báo"
                    />
                </div>

                {/* Video Media Section fixed to bottom */}
                <VideoSection news={videoNews} />
            </main>

            <Footer />
        </div>
    )
}
