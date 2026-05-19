"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ContactForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công!",
          description: data.message,
        })
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Có lỗi xảy ra, vui lòng thử lại",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn, vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Họ và tên <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Số điện thoại</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const val = e.target.value
              if (/\D/.test(val)) {
                setPhoneError("Số điện thoại chỉ được chứa các chữ số")
              } else {
                setPhoneError("")
              }
              const numericVal = val.replace(/\D/g, '')
              if (numericVal.length > 0 && !numericVal.startsWith('0')) {
                setPhoneError("Số điện thoại phải bắt đầu bằng số 0")
              }
              setFormData({ ...formData, phone: numericVal.startsWith('0') || numericVal.length === 0 ? numericVal : '' })
            }}
            className={phoneError ? "w-full px-4 py-3 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50" : "w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"}
            placeholder="0912 345 678"
          />
          {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Chủ đề <span className="text-destructive">*</span>
          </label>
          <select
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">Chọn chủ đề</option>
            <option value="job-inquiry">Tư vấn việc làm</option>
            <option value="company-inquiry">Doanh nghiệp hợp tác</option>
            <option value="technical-support">Hỗ trợ kỹ thuật</option>
            <option value="feedback">Góp ý - Phản hồi</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Nội dung <span className="text-destructive">*</span>
        </label>
        <Textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          placeholder="Nhập nội dung tin nhắn của bạn..."
          className="bg-background"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 py-6 text-lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang gửi...
          </>
        ) : (
          "Gửi tin nhắn"
        )}
      </Button>
    </form>
  )
}
