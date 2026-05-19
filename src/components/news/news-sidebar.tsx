import React from "react"
import { Mail, ArrowRight, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface NewsSidebarProps {
    onTagClick: (tag: string) => void
}

const SOURCES = [
    { name: "VietnamWorks", logo: "https://www.google.com/s2/favicons?domain=vietnamworks.com&sz=128", url: "https://www.vietnamworks.com/" },
    { name: "TopCV", logo: "https://www.google.com/s2/favicons?domain=topcv.vn&sz=128", url: "https://www.topcv.vn/" },
    { name: "GDU Research", logo: "https://www.google.com/s2/favicons?domain=giadinh.edu.vn&sz=128", url: "https://jsgdu.vn/" }
]

export function NewsSidebar({ onTagClick }: NewsSidebarProps) {
    const { toast } = useToast()
    const [isSubscribing, setIsSubscribing] = React.useState(false)

    const handleSubscribe = () => {
        setIsSubscribing(true)
        // Simulate a small delay for better UX
        setTimeout(() => {
            toast({
                title: "Đăng ký thành công!",
                description: "Hệ thống đã ghi nhận yêu cầu của bạn.",
                variant: "success" as any, // Use success variant if available
            })
            setIsSubscribing(false)
        }, 500)
    }

    return (
        <aside className="space-y-8">
            {/* Newsletter Subscription Card */}
            <div className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-primary/10">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Mail className="w-6 h-6" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Quan Tâm</h3>
                    <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                        Thông báo việc làm - Hoàn toàn miễn phí và dễ dàng
                    </p>
                    <Button
                        type="button"
                        disabled={isSubscribing}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubscribe();
                        }}
                        className="w-full py-6 bg-white text-primary hover:bg-slate-50 font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 border-none cursor-pointer relative z-50 pointer-events-auto"
                    >
                        {isSubscribing ? "ĐANG XỬ LÝ..." : "Tạo Ngay"}
                    </Button>
                </div>
            </div>

            {/* Trending Tags Section */}
            <div className="p-8 bg-slate-50 rounded-[32px]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Từ khóa hot</h3>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                    {["Thực tập sinh", "Fresher IT", "CV Mẫu", "Phỏng vấn", "GDU Alumni", "Skill Up"].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onTagClick(tag);
                            }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sources Section */}
            <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Theo nguồn tin</h3>
                </div>
                <div className="space-y-4">
                    {SOURCES.map((source) => (
                        <a
                            key={source.name}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform relative">
                                <img
                                    src={source.logo}
                                    alt={source.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors block">
                                    {source.name}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </aside>
    )
}
