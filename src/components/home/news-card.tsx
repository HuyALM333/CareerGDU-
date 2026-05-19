"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, ArrowUpRight, ExternalLink, TrendingUp, Newspaper } from "lucide-react"
import { News } from "@/types"

interface NewsCardProps {
    news: News
}

export function NewsCard({ news }: NewsCardProps) {
    const [imgSrc, setImgSrc] = useState(news.imageUrl || "")

    const publishedDate = new Date(news.publishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })

    return (
        <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full hover:-translate-y-1">
            {/* Image Section */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImgSrc("https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80")}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-slate-200" />
                    </div>
                )}

                {/* Category Badge - Minimalist Pill */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur text-primary text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm border border-white/50">
                        {news.category}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        {news.sourceName}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {publishedDate}
                    </div>
                </div>

                <Link href={`/news/${news._id}`} className="block mb-4">
                    <h3 className="text-xl font-bold line-clamp-2 leading-[1.3] group-hover:text-primary transition-colors">
                        {news.title}
                    </h3>
                </Link>

                <p className="text-[14px] text-slate-500 line-clamp-3 mb-8 flex-grow leading-[1.6] font-normal">
                    {news.summary}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <Link
                        href={`/news/${news._id}`}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary group/link group-hover:gap-3 transition-all"
                    >
                        Chi tiết bài viết
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {news.readingTime && (
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 opacity-50" />
                                {news.readingTime}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 opacity-50" />
                            {news.views.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
