"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Monitor,
    Film,
    ShoppingCart,
    Building2,
    Gavel,
    Languages,
    CreditCard,
    Stethoscope,
    ArrowRight,
    TrendingUp,
} from "lucide-react"

// Field data with icons and simulated job counts
const fieldsData = [
    {
        id: "healthcare",
        name: "Sức khỏe",
        icon: Stethoscope,
        jobs: 47,
        color: "from-rose-500 to-pink-600",
        bgColor: "bg-rose-50",
        iconColor: "text-rose-600",
        majors: ["Răng – Hàm – Mặt", "Điều dưỡng", "Phục hồi chức năng"],
    },
    {
        id: "it",
        name: "Công nghệ thông tin",
        icon: Monitor,
        jobs: 188,
        color: "from-blue-500 to-cyan-600",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
        majors: ["Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "An toàn thông tin"],
    },
    {
        id: "media",
        name: "Truyền thông",
        icon: Film,
        jobs: 93,
        color: "from-orange-500 to-red-600",
        bgColor: "bg-orange-50",
        iconColor: "text-orange-600",
        majors: ["Truyền thông đa PT", "Quan hệ công chúng"],
    },
    {
        id: "business",
        name: "Kinh doanh",
        icon: ShoppingCart,
        jobs: 156,
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-emerald-50",
        iconColor: "text-emerald-600",
        majors: ["Kinh doanh quốc tế", "Thương mại điện tử"],
    },
    {
        id: "management",
        name: "Quản trị",
        icon: Building2,
        jobs: 234,
        color: "from-violet-500 to-purple-600",
        bgColor: "bg-violet-50",
        iconColor: "text-violet-600",
        majors: ["Quản trị kinh doanh", "Marketing", "Logistics"],
    },
    {
        id: "law",
        name: "Luật",
        icon: Gavel,
        jobs: 68,
        color: "from-amber-500 to-yellow-600",
        bgColor: "bg-amber-50",
        iconColor: "text-amber-600",
        majors: ["Luật kinh doanh", "Luật thương mại QT"],
    },
    {
        id: "social-lang",
        name: "Ngôn ngữ",
        icon: Languages,
        jobs: 124,
        color: "from-sky-500 to-indigo-600",
        bgColor: "bg-sky-50",
        iconColor: "text-sky-600",
        majors: ["Ngôn ngữ Anh", "Tâm lý học", "Đông phương học"],
    },
    {
        id: "finance",
        name: "Tài chính",
        icon: CreditCard,
        jobs: 202,
        color: "from-green-500 to-emerald-600",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
        majors: ["Tài chính – Ngân hàng", "Fintech", "Kế toán"],
    },
]

export function MajorsSection() {
    const [hoveredField, setHoveredField] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    const totalJobs = fieldsData.reduce((sum, field) => sum + field.jobs, 0)

    // Prevent hydration mismatch with toLocaleString
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const [config, setConfig] = useState<any>(null)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/site-configs?key=home_majors")
                const result = await res.json()
                if (result.success && result.data) {
                    setConfig(result.data)
                }
            } catch (error) {
                console.error("Error fetching majors config:", error)
            }
        }
        fetchConfig()
    }, [])

    return (
        <section className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <TrendingUp className="w-4 h-4" />
                        <span>{isMounted ? totalJobs.toLocaleString() : totalJobs}+ {config?.badge || "việc làm đang tuyển"}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {config?.title || "Khám phá theo Lĩnh vực"}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {config?.description || "Tìm kiếm cơ hội việc làm phù hợp với ngành học và đam mê của bạn"}
                    </p>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {fieldsData.map((field) => {
                        const Icon = field.icon
                        const isHovered = hoveredField === field.id

                        return (
                            <Link
                                key={field.id}
                                href={`/jobs?field=${field.id}`}
                                className="group"
                                onMouseEnter={() => setHoveredField(field.id)}
                                onMouseLeave={() => setHoveredField(null)}
                            >
                                <div
                                    className={`
                    relative overflow-hidden rounded-2xl p-5 min-h-[200px]
                    bg-white border-2 border-gray-100
                    transition-all duration-300 ease-out
                    hover:border-transparent hover:shadow-xl hover:-translate-y-1
                    flex flex-col items-center
                  `}
                                >
                                    {/* Gradient Background on Hover */}
                                    <div
                                        className={`
                      absolute inset-0 bg-gradient-to-br ${field.color} 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    `}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center text-center h-full">
                                        {/* Icon Container */}
                                        <div
                                            className={`
                        w-14 h-14 rounded-xl flex items-center justify-center mb-3
                        transition-all duration-300
                        ${field.bgColor} ${field.iconColor}
                        group-hover:bg-white/20 group-hover:text-white
                      `}
                                        >
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        {/* Field Name */}
                                        <h3
                                            className={`
                        font-semibold text-gray-900 mb-2 text-sm leading-tight
                        transition-colors duration-300
                        group-hover:text-white
                      `}
                                        >
                                            {field.name}
                                        </h3>

                                        {/* Switcher Container - Fixed Height */}
                                        <div className="h-[60px] flex items-center justify-center">
                                            {/* Job Count - Visible by default */}
                                            <div
                                                className={`
                          absolute transition-all duration-300 ease-out
                          ${isHovered
                                                        ? "opacity-0 -translate-y-2 pointer-events-none"
                                                        : "opacity-100 translate-y-0"
                                                    }
                        `}
                                            >
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
                                                    {field.jobs} việc làm
                                                </span>
                                            </div>

                                            {/* Majors Preview - Visible on hover */}
                                            <div
                                                className={`
                          absolute transition-all duration-300 ease-out
                          ${isHovered
                                                        ? "opacity-100 translate-y-0"
                                                        : "opacity-0 translate-y-2 pointer-events-none"
                                                    }
                        `}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    {field.majors.slice(0, 2).map((major, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] text-white bg-white/25 px-2 py-0.5 rounded-full whitespace-nowrap"
                                                        >
                                                            {major}
                                                        </span>
                                                    ))}
                                                    {field.majors.length > 2 && (
                                                        <span className="text-[10px] text-white/80">
                                                            +{field.majors.length - 2} ngành khác
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-10">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 px-8 py-3.5 
              bg-white border-2 border-gray-200 rounded-full
              font-semibold text-gray-700
              hover:border-primary hover:text-primary hover:shadow-lg
              transition-all duration-300"
                    >
                        Xem thêm ngành nghề
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
