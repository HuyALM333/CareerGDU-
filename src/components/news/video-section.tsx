"use client"

import { Play, ArrowRight, Newspaper } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { News } from "@/types"

interface VideoSectionProps {
    news: News[]
}

export function VideoSection({ news }: VideoSectionProps) {
    if (news.length === 0) return null;

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="flex items-end justify-between mb-12">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Media Library</span>
                        <h2 className="text-4xl font-black tracking-tight">Video</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((v) => (
                        <div
                            key={v._id}
                            className="group cursor-pointer"
                            onClick={() => v.videoUrl ? window.open(v.videoUrl, '_blank') : null}
                        >
                            <div className="relative aspect-video rounded-[32px] overflow-hidden mb-6 bg-slate-800">
                                {v.imageUrl ? (
                                    <img
                                        src={v.imageUrl}
                                        alt={v.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Newspaper className="w-12 h-12 text-slate-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                                        <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                {v.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
