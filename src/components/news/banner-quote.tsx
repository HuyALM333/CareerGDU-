"use client"

import Image from "next/image"
import { Quote } from "lucide-react"
import { News } from "@/types"

interface BannerQuoteProps {
    news?: News
}

export function BannerQuote({ news }: BannerQuoteProps) {
    if (!news) return null;

    return (
        <section className="container px-4 mx-auto py-24">
            <div className="relative overflow-hidden rounded-[64px] bg-slate-50 border border-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center">
                    <div className="p-10 md:p-16 lg:p-24 relative z-10">
                        <div className="p-4 bg-primary/10 rounded-2xl inline-block mb-8">
                            <Quote className="w-8 h-8 text-primary fill-primary/10" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-[1.15] tracking-tight">
                            Đón lấy thành công cùng cộng đồng sinh viên GDU toàn cầu!
                        </h2>

                        <div className="space-y-6 border-l-4 border-primary pl-8 mt-12">
                            <p className="text-slate-500 text-lg md:text-xl font-medium italic leading-relaxed">
                                "{news.summary}"
                            </p>
                            <div>
                                <h4 className="text-lg font-black text-slate-900">{news.title}</h4>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {news.content.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-[4/3] lg:aspect-square">
                        {news.imageUrl && (
                            <Image
                                src={news.imageUrl}
                                alt={news.title}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            </div>
        </section>
    )
}
