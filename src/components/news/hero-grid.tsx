"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { News } from "@/types"
import { Calendar, ArrowUpRight } from "lucide-react"

interface HeroGridProps {
    featuredNews: News[]
}

export function HeroGrid({ featuredNews }: HeroGridProps) {
    const [mainImg, setMainImg] = useState(featuredNews[0]?.imageUrl || "")
    const [secImgs, setSecImgs] = useState(featuredNews.slice(1, 3).map(n => n.imageUrl || ""))

    if (featuredNews.length === 0) return null

    const mainNews = featuredNews[0]
    const secondaryNews = featuredNews.slice(1, 3)

    return (
        <section className="container px-4 mx-auto py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Main Featured News */}
                <div className="lg:col-span-8 group relative overflow-hidden rounded-[32px] bg-slate-100 aspect-[16/9] lg:aspect-auto h-full min-h-[400px] md:min-h-[500px]">
                    {mainImg && (
                        <img
                            src={mainImg}
                            alt={mainNews.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={() => setMainImg("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80")}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                                {mainNews.category}
                            </span>
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(mainNews.publishedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <Link href={`/news/${mainNews._id}`}>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] group-hover:text-primary transition-colors line-clamp-2">
                                {mainNews.title}
                            </h2>
                        </Link>
                        <p className="text-white/70 text-lg line-clamp-2 max-w-3xl mb-8 font-medium leading-relaxed">
                            {mainNews.summary}
                        </p>
                        <Link
                            href={`/news/${mainNews._id}`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/10"
                        >
                            Đọc bài viết ngay
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Secondary News / Banners */}
                <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                    {secondaryNews.map((news, idx) => (
                        <div key={news._id} className="group relative flex-1 overflow-hidden rounded-[28px] bg-slate-100 aspect-[16/9] md:aspect-auto min-h-[220px]">
                            {secImgs[idx] && (
                                <img
                                    src={secImgs[idx]}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={() => {
                                        const newImgs = [...secImgs];
                                        newImgs[idx] = "https://images.unsplash.com/photo-1454165833767-131438cf58ff?w=800&q=80";
                                        setSecImgs(newImgs);
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest mb-3">
                                    {news.category}
                                </span>
                                <Link href={`/news/${news._id}`}>
                                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {news.title}
                                    </h3>
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Quick Link/Banner Placeholder */}
                    <div className="bg-primary rounded-[28px] p-8 flex flex-col justify-center text-white relative overflow-hidden group min-h-[140px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <h4 className="text-xl font-black mb-2 relative z-10">Cẩm nang tuyển dụng 2026</h4>
                        <p className="text-white/60 text-sm font-medium relative z-10 mb-4">Tải ngay bản báo cáo mới nhất</p>
                        <Link href="/news?category=Cẩm nang" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                            Tìm hiểu ngay <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
