"use client"

import { useRef, useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import { News } from "@/types"
import { NewsCard } from "@/components/home/news-card"
import Link from "next/link"

interface CategorySectionProps {
    title: string
    description?: string
    news: News[]
    viewAllHref: string
}

export function CategorySection({ title, description, news, viewAllHref }: CategorySectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [news])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    if (news.length === 0) return null

    return (
        <section className="py-16 md:py-20 border-t border-slate-100 bg-white">
            <div className="container px-4 mx-auto">
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 group flex items-center gap-3">
                            {title}
                            <span className="w-12 h-1 bg-primary rounded-full hidden md:block" />
                        </h2>
                        {description && (
                            <p className="text-slate-500 text-lg font-medium">{description}</p>
                        )}
                    </div>

                    <Link
                        href={viewAllHref}
                        scroll={false}
                        className="group flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-primary hover:text-primary/70 transition-all"
                    >
                        Xem thêm
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="relative group/slider">
                    {/* Navigation Buttons */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 transition-all hidden md:flex"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {showRightArrow && (
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 transition-all hidden md:flex"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    {/* Content */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {news.map((item) => (
                            <div key={item._id} className="min-w-[300px] md:min-w-[420px] max-w-[420px] snap-start">
                                <NewsCard news={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
