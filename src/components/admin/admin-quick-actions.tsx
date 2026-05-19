"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
    Plus,
    Zap,
    LayoutDashboard,
    Newspaper,
    Briefcase,
    Loader2,
    X,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname } from "next/navigation"

export function AdminQuickActions() {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isQuickNewsOpen, setIsQuickNewsOpen] = useState(false)
    const [quickUrl, setQuickUrl] = useState("")
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        const handleClose = () => setIsOpen(false)
        window.addEventListener("close-admin-menu", handleClose)
        return () => window.removeEventListener("close-admin-menu", handleClose)
    }, [])

    const toggleMenu = () => {
        const nextState = !isOpen
        setIsOpen(nextState)
        if (nextState) {
            window.dispatchEvent(new CustomEvent("close-chat-menu"))
        }
    }

    if (!user || user.role !== "admin" || pathname?.startsWith('/dashboard')) return null

    const handleQuickNews = async () => {
        if (!quickUrl) {
            toast({ title: "Thiếu URL", description: "Vui lòng nhập link bài báo", variant: "destructive" })
            return
        }

        setIsFetching(true)
        try {
            const res = await fetch("/api/news/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: quickUrl }),
            })
            const result = await res.json()

            if (result.success) {
                sessionStorage.setItem("quick_post_metadata", JSON.stringify({
                    ...result.data,
                    sourceUrl: quickUrl
                }))
                setIsQuickNewsOpen(false)
                setQuickUrl("")
                setIsOpen(false)
                router.push("/dashboard/admin/news")
                toast({ title: "Đang chuyển hướng...", description: "Hệ thống đang mở trang đăng tin với thông tin đã lấy được." })
            } else {
                toast({ title: "Lỗi", description: result.error || "Không thể lấy thông tin", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setIsFetching(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-6 z-50">
            {isOpen && (
                <Card className="absolute bottom-20 right-0 w-80 shadow-2xl animate-in slide-in-from-bottom-5 border-none overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-[#0A2647] text-white pb-3 pt-6 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Menu Quản trị nhanh</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10 h-8 w-8 rounded-xl"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-white">
                        <div className="space-y-2">
                            {/* News Card */}
                            <button
                                onClick={() => setIsQuickNewsOpen(true)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-yellow-50 transition-all group/item text-left border border-transparent hover:border-yellow-100"
                            >
                                <div className="bg-yellow-100 p-2.5 rounded-xl group-hover/item:scale-110 transition-transform">
                                    <Zap className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 group-hover/item:text-yellow-700">Đăng tin nhanh</div>
                                    <div className="text-[10px] text-slate-500 font-medium tracking-wide">Tự động lấy tin từ URL</div>
                                </div>
                            </button>

                            {/* Job Card */}
                            <button
                                onClick={() => {
                                    router.push("/dashboard/jobs/new")
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all group/item text-left border border-transparent hover:border-blue-100"
                            >
                                <div className="bg-blue-100 p-2.5 rounded-xl group-hover/item:scale-110 transition-transform">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 group-hover/item:text-blue-700">Đăng việc làm</div>
                                    <div className="text-[10px] text-slate-500 font-medium tracking-wide">Mở form tạo việc làm mới</div>
                                </div>
                            </button>

                            <div className="h-px bg-slate-100 mx-2 my-2" />

                            {/* Dashboard Card */}
                            <button
                                onClick={() => {
                                    router.push("/dashboard")
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-100 transition-all group/item text-left"
                            >
                                <div className="bg-slate-100 p-2.5 rounded-xl group-hover/item:scale-110 transition-transform">
                                    <LayoutDashboard className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="font-bold text-slate-700 group-hover/item:text-slate-900">Trang quản trị chính</div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={toggleMenu}
                className={`h-14 w-14 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-300 bg-[#0A2647] hover:bg-[#0A2647]/90 active:scale-95 border-2 border-yellow-500/50 ring-4 ring-yellow-500/10`}
            >
                {isOpen ? (
                    <X className="h-7 w-7 text-white" />
                ) : (
                    <Zap className="h-7 w-7 text-yellow-400 fill-yellow-400" />
                )}
            </Button>

            {/* Quick News Modal */}
            <Dialog open={isQuickNewsOpen} onOpenChange={setIsQuickNewsOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-[#0A2647]">Đăng tin tức nhanh</DialogTitle>
                        <DialogDescription className="text-base font-medium">
                            Dán link bài báo vào đây, hệ thống sẽ tự động trích xuất thông tin cơ bản.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="grid gap-3">
                            <Label htmlFor="global-quick-url" className="text-sm font-bold uppercase tracking-wider text-slate-500">Link bài báo (URL)</Label>
                            <Input
                                id="global-quick-url"
                                placeholder="https://vnexpress.net/..."
                                value={quickUrl}
                                onChange={(e) => setQuickUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickNews()
                                }}
                                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:border-yellow-500 focus:ring-yellow-500/20 text-lg transition-all"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-4">
                        <Button variant="ghost" onClick={() => setIsQuickNewsOpen(false)} className="rounded-xl px-8 font-bold">Hủy</Button>
                        <Button
                            onClick={handleQuickNews}
                            disabled={isFetching}
                            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all min-w-[140px]"
                        >
                            {isFetching ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lấy...
                                </>
                            ) : (
                                "Tiếp tục"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
