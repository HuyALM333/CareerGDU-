"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Flag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportJobDialogProps {
    jobId: string
    jobTitle: string
    companyName: string
}

export function ReportJobDialog({ jobId, jobTitle, companyName }: ReportJobDialogProps) {
    const { toast } = useToast()
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        reporterName: "",
        reporterPhone: "",
        reporterEmail: "",
        content: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.reporterName || !formData.reporterPhone || !formData.content) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung phản ánh.",
                variant: "destructive"
            })
            return
        }

        try {
            setLoading(true)
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId,
                    jobTitle,
                    companyName,
                    userId: user?._id || user?.id, // Capture userId if logged in
                    ...formData
                })
            })

            const data = await res.json()

            if (data.success) {
                toast({
                    title: "Đã gửi phản ánh",
                    description: "Cảm ơn bạn đã phản ánh. Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
                })
                setOpen(false)
                setFormData({
                    reporterName: "",
                    reporterPhone: "",
                    reporterEmail: "",
                    content: ""
                })
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể gửi phản ánh. Vui lòng thử lại sau.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Trigger can be customized by parent if needed, but default is a button/link */}
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mt-4 mx-auto md:mx-0">
                    <Flag className="h-4 w-4" />
                    <span>Báo cáo tin tuyển dụng</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2">
                        <Flag className="h-5 w-5" />
                        Phản ánh tin tuyển dụng không chính xác
                    </DialogTitle>
                    <DialogDescription>
                        Hãy tìm hiểu kỹ về nhà tuyển dụng và công việc bạn ứng tuyển. Nếu bạn thấy rằng tin tuyển dụng này không đúng, hãy phản ánh với chúng tôi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tin tuyển dụng</Label>
                        <p className="text-sm font-medium border rounded-md p-2 bg-muted/50">
                            {jobTitle} - {companyName}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Họ và tên <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            placeholder="Nhập họ và tên của bạn"
                            value={formData.reporterName}
                            onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Số điện thoại <span className="text-destructive">*</span></Label>
                        <Input
                            id="phone"
                            placeholder="Nhập số điện thoại liên hệ"
                            value={formData.reporterPhone}
                            onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Nhập email (không bắt buộc)"
                            value={formData.reporterEmail}
                            onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content">Nội dung phản ánh <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="content"
                            placeholder="Bạn vui lòng cung cấp rõ thông tin hoặc bằng chứng (nếu có)..."
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gửi phản ánh
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
