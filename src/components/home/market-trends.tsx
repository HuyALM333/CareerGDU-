"use client"

import { useEffect, useState } from "react"
import { News } from "@/types"
import { NewsCard } from "./news-card"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp, Sparkles, Search } from "lucide-react"
import Link from "next/link"

const DEFAULT_CONFIG = {
    title: "Bạn đã sẵn sàng đón đầu xu hướng?",
    description: "Khám phá ngay hàng ngàn cơ hội việc làm hấp dẫn phù hợp với kỹ năng của bạn.",
    hotTags: ["#Intern", "#ReactJS", "#Marketing", "#Designer", "#AI"]
}

export function MarketTrends() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch("/api/news?limit=3")
                const result = await response.json()
                if (result.success) {
                    setNews(result.data)
                }
            } catch (error) {
                console.error("Error fetching market trends:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    const [config, setConfig] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/site-configs?key=home_quick_search")
                const result = await res.json()
                if (result.success && result.data) {
                    setConfig(result.data)
                }
            } catch (error) {
                console.error("Error fetching section config:", error)
            }
        }
        fetchConfig()
    }, [])

    const handleSearch = () => {
        if (searchQuery.trim()) {
            window.location.href = `/jobs?search=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    if (loading) {
        return (
            <section className="py-20 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="mt-16 p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-blue-900/5 flex flex-col lg:flex-row items-center gap-10 justify-between animate-pulse">
                        <div className="flex items-center gap-6 max-w-xl w-full">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-3/4 bg-slate-100 rounded" />
                                <div className="h-4 w-full bg-slate-100 rounded" />
                            </div>
                        </div>
                        <div className="w-full lg:w-96 h-14 bg-slate-50 rounded-2xl" />
                    </div>
                </div>
            </section>
        )
    }

    if (news.length === 0) return null

    return (
        <section className="py-20 bg-muted/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <TrendingUp className="w-4 h-4" />
                            <span>Thống kê & Dự báo</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            Xu hướng & <span className="text-primary italic">Tin thị trường</span> việc làm
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Thông tin phân tích, dự báo tuyển dụng được tổng hợp tự động từ các nguồn uy tín như VietnamWorks, TopCV, World Bank... giúp sinh viên đón đầu xu hướng nghề nghiệp.
                        </p>
                    </div>
                    <Button variant="outline" className="group hidden md:flex" asChild>
                        <Link href="/news">
                            Xem tất cả tin tức
                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((item) => (
                        <NewsCard key={item._id} news={item} />
                    ))}
                </div>

                <div className="mt-12 flex justify-center md:hidden">
                    <Button variant="outline" className="w-full group" asChild>
                        <Link href="/news">
                            Xem tất cả tin tức
                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                {/* Quick Job Search Section - Dynamic from DB */}
                <div className="mt-16 p-8 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-blue-900/5 flex flex-col lg:flex-row items-center gap-10 justify-between">
                    <div className="flex items-center gap-6 max-w-xl">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-2xl text-[#0A2647] mb-2">
                                {config?.title || DEFAULT_CONFIG.title}
                            </h4>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {config?.description || DEFAULT_CONFIG.description}
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto flex-grow max-w-2xl space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Nhập kỹ năng, vị trí công việc..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-40 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-slate-50/50 text-slate-900 font-medium"
                            />
                            <div className="absolute right-2 top-2 bottom-2">
                                <Button onClick={handleSearch} className="h-full px-6 rounded-xl bg-[#0A2647] hover:bg-[#0A2647]/90 text-white shadow-lg shadow-blue-900/20">
                                    Tìm kiếm ngay
                                </Button>
                            </div>
                        </div>

                        {/* Hot Tags */}
                        {(config?.hotTags || DEFAULT_CONFIG.hotTags).length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pl-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Hot:</span>
                                {(config?.hotTags || DEFAULT_CONFIG.hotTags).map((tag: string) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            const searchTag = tag.startsWith('#') ? tag.substring(1) : tag;
                                            window.location.href = `/jobs?search=${encodeURIComponent(searchTag)}`;
                                        }}
                                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-500 text-xs font-bold transition-all border border-transparent hover:border-primary/20"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

