"use client"

import { useEffect, useState, use } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { News } from "@/types"
import { Calendar, Eye, ArrowLeft, ExternalLink, Share2, MessageSquare, Bookmark, TrendingUp, Clock, Play, Link as LinkIcon, Image as ImageIcon, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [news, setNews] = useState<News | null>(null)
    const [loading, setLoading] = useState(true)
    const [relatedNews, setRelatedNews] = useState<News[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const response = await fetch(`/api/news?id=${id}`)
                const result = await response.json()
                if (result.success) {
                    setNews(result.data)

                    // Fetch related news (same category)
                    const relatedRes = await fetch(`/api/news?category=${result.data.category}&limit=4`)
                    const relatedResult = await relatedRes.json()
                    if (relatedResult.success) {
                        setRelatedNews(relatedResult.data.filter((item: News) => item._id !== id))
                    }
                }
            } catch (error) {
                console.error("Error fetching news detail:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNewsDetail()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold">Không tìm thấy bài viết</h2>
                    <Button onClick={() => router.push("/news")}>Quay lại trang tin tức</Button>
                </div>
                <Footer />
            </div>
        )
    }

    const publishedDate = new Date(news.publishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    })

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Clean Editorial Header - Professional Refinement */}
                <div className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/hero-bg.png')" }}
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-primary/95 lg:bg-primary/90" />

                    <div className="container px-4 mx-auto relative z-10">
                        <Link
                            href="/news"
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-white/40 mb-12 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                            QUAY LẠI TIN TỨC
                        </Link>

                        <div className="max-w-4xl">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                                {news.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4">
                                <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/10">
                                    {news.category}
                                </span>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-4">
                                    <div className="w-[1px] h-3 bg-white/20" />
                                    {news.sourceName}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container px-4 mx-auto py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
                        {/* Main Content */}
                        <article className="flex-1 max-w-4xl">
                            <div className="prose prose-lg md:prose-xl max-w-none prose-slate">
                                <div className="p-10 md:p-14 bg-slate-50/50 rounded-[40px] border border-slate-100/50 mb-16">
                                    <div
                                        className="text-xl md:text-2xl font-semibold italic text-slate-800 leading-[1.6] m-0"
                                        dangerouslySetInnerHTML={{ __html: news.summary }}
                                    />
                                </div>

                                <div
                                    className="whitespace-pre-line text-[17px] md:text-[19px] leading-[1.8] text-slate-600 space-y-10 font-normal mb-16"
                                    dangerouslySetInnerHTML={{ __html: news.content }}
                                />

                                {/* Rich Media: Gallery */}
                                {news.gallery && news.gallery.length > 0 && (
                                    <div className="space-y-6 mb-16">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-primary" /> Bộ sưu tập hình ảnh
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {news.gallery.map((url, idx) => (
                                                <div key={idx} className="relative aspect-[16/10] rounded-3xl overflow-hidden group">
                                                    <Image
                                                        src={url}
                                                        alt={`${news.title} gallery ${idx}`}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rich Media: Videos */}
                                {news.videoUrls && news.videoUrls.length > 0 && (
                                    <div className="space-y-6 mb-16">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Play className="w-5 h-5 text-primary" /> Video liên quan
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {news.videoUrls.map((url, idx) => (
                                                <div key={idx} className="aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
                                                    <iframe
                                                        src={url.replace("watch?v=", "embed/")}
                                                        className="w-full h-full"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Related Links Section */}
                                {news.relatedLinks && news.relatedLinks.length > 0 && (
                                    <div className="p-8 md:p-10 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col gap-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <LinkIcon className="w-5 h-5 text-primary" /> Liên kết tham khảo
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {news.relatedLinks.map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    href={link.url}
                                                    target="_blank"
                                                    className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group"
                                                >
                                                    <span className="font-bold text-slate-700 group-hover:text-primary transition-colors line-clamp-1">{link.title}</span>
                                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reorganized Action Area - Left Aligned and Tidy */}
                            <div className="mt-20 pt-12 border-t border-slate-100 space-y-12">
                                {/* Primary Action: View at Source */}
                                <div>
                                    <a
                                        href={news.sourceUrl}
                                        target="_blank"
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 group"
                                    >
                                        XEM TẠI NGUỒN: {news.sourceName}
                                        <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </div>

                                {/* Interactive Tags Section */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block pb-2">Chủ đề liên quan:</span>
                                    <div className="flex flex-wrap gap-3">
                                        {(news.tags && news.tags.length > 0 ? news.tags : ["Thị trường", "Việc làm", "GDU"]).map(tag => (
                                            <button
                                                key={tag}
                                                className="px-6 py-3 bg-slate-50 text-slate-500 text-xs font-bold rounded-2xl uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-all border border-slate-100 hover:border-primary/20"
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Clean Share Section */}
                                <div className="flex items-center gap-6 pt-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Chia sẻ bài viết:</span>
                                    <div className="flex gap-3">
                                        <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                        <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm">
                                            <MessageSquare className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="w-full lg:w-80 space-y-16">
                            {/* Related News */}
                            <div>
                                <h3 className="text-[11px] font-bold mb-8 flex items-center gap-2 text-slate-400 uppercase tracking-[0.3em]">
                                    Bài viết liên quan
                                </h3>
                                <div className="space-y-10">
                                    {relatedNews.length > 0 ? relatedNews.map(item => (
                                        <Link key={item._id} href={`/news/${item._id}`} className="flex flex-col gap-4 group">
                                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                                                {item.imageUrl && (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-slate-400">
                                                    <span className="uppercase tracking-wider">{item.category}</span>
                                                    <span className="opacity-30">•</span>
                                                    <span>{new Date(item.publishedAt).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <p className="text-sm text-slate-400">Đang cập nhật...</p>
                                    )}
                                </div>
                            </div>

                            {/* Newsletter Signup */}
                            <div className="bg-primary p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                <h3 className="text-xl font-bold mb-3 relative z-10">Đăng ký nhận tin</h3>
                                <p className="text-sm text-white/60 mb-8 relative z-10 leading-relaxed font-light">Nhận báo cáo thị trường và dự báo việc làm hàng tuần qua email.</p>
                                <div className="space-y-4 relative z-10">
                                    <input
                                        type="email"
                                        placeholder="Email của bạn..."
                                        className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-sm transition-all shadow-inner"
                                    />
                                    <button className="w-full h-14 rounded-2xl bg-white text-primary font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all shadow-lg">
                                        ĐĂNG KÝ NGAY
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
