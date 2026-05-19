"use client"

import type React from "react"
import { useState, useRef } from "react"
import { User, Mail, Phone, Save, Upload, Loader2, Edit2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { normalizeWhitespace } from "@/lib/utils"

interface UserProfileFormProps {
    title?: string
    description?: string
    className?: string
    showAvatar?: boolean
}

export function UserProfileForm({
    title = "Thông tin cá nhân",
    description = "Cập nhật thông tin cá nhân của bạn",
    className,
    showAvatar = true
}: UserProfileFormProps) {
    const { user, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    })

    // Synchronize form data with user data when not editing
    // useEffect(() => {
    //   if (!isEditing && user) {
    //     setFormData({
    //       name: user.name || "",
    //       email: user.email || "",
    //       phone: user.phone || "",
    //     })
    //   }
    // }, [user, isEditing])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        if (formData.phone && !/^0\d{9,10}$/.test(formData.phone)) {
            setPhoneError("Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số")
            return
        }

        setIsSaving(true)
        const normalizedName = normalizeWhitespace(formData.name)
        const normalizedPhone = normalizeWhitespace(formData.phone)

        await updateProfile({
            name: normalizedName,
            phone: normalizedPhone
            // Email is usually not editable or requires special handling, but let's keep it consistent
        })
        // Update local state to reflect normalized text
        setFormData(prev => ({ ...prev, name: normalizedName, phone: normalizedPhone }))
        setIsEditing(false)
        setIsSaving(false)
        toast({ title: "Đã lưu", description: "Thông tin hồ sơ đã được cập nhật." })
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("userId", user?.id || "")

        try {
            const response = await fetch("/api/user/upload-avatar", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.success) {
                await updateProfile({ avatar: data.url })
                toast({ title: "Thành công", description: "Ảnh đại diện đã được cập nhật." })
            } else {
                toast({ title: "Lỗi", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast({ title: "Lỗi", description: "Không thể tải ảnh lên.", variant: "destructive" })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <Card className={`border-none shadow-2xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden ${className}`}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-500 mt-1">{description}</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="h-10 px-5 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <Edit2 className="h-4 w-4 mr-2 text-primary" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                className="h-10 px-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Hủy
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-10 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex flex-col gap-10">
                    {/* Avatar Section - Centered */}
                    {showAvatar && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group" onClick={handleAvatarClick}>
                                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-primary/60 p-1 shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-primary text-4xl font-black overflow-hidden border-4 border-white">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0) || "U"
                                        )}
                                    </div>
                                </div>
                                <div className="absolute inset-1 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-white mb-1" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Tải lên</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chạm để đổi ảnh</p>
                                <p className="text-[10px] text-gray-300 font-medium italic">Kích thước khuyên dùng: 512x512px</p>
                            </div>
                        </div>
                    )}

                    {/* Fields Section */}
                    <div className="space-y-6 max-w-2xl mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Họ và tên</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Nhập họ và tên đầy đủ"
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Số điện thoại</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            if (/\D/.test(val)) return
                                            setFormData({ ...formData, phone: val })
                                            if (val.length > 0) {
                                                if (!val.startsWith('0')) {
                                                    setPhoneError("Số điện thoại phải bắt đầu bằng số 0")
                                                } else if (val.length < 10 || val.length > 11) {
                                                    setPhoneError("Số điện thoại phải có 10-11 số")
                                                } else {
                                                    setPhoneError("")
                                                }
                                            } else {
                                                setPhoneError("")
                                            }
                                        }}
                                        disabled={!isEditing}
                                        placeholder="09xx xxx xxx"
                                        className={phoneError ? "w-full pl-12 pr-5 py-3.5 bg-red-50/30 border border-red-100 rounded-2xl font-bold text-red-900 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all disabled:opacity-50" : "w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"}
                                    />
                                </div>
                                {phoneError && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{phoneError}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Email liên hệ</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        disabled={true}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl font-bold text-gray-500 cursor-not-allowed opacity-70"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded-md">ReadOnly</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
