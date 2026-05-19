"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Globe, MapPin, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserProfileForm } from "@/components/dashboard/user-profile-form"
import { useEffect } from "react"
import { normalizeWhitespace } from "@/lib/utils"

export default function CompanyPage() {
    const { user, updateProfile } = useAuth()
    const { toast } = useToast()

    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isLoading, setIsLoading] = useState(false)

    // Initial state
    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        address: "",
        description: "",
        size: ""
    })

    // Fetch latest data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            const userId = user._id || user.id
            if (!userId) return

            try {
                const res = await fetch(`/api/users/${userId}`)
                const data = await res.json()

                if (data.success && data.user) {
                    const u = data.user
                    setFormData({
                        companyName: u.companyName || "Công ty của " + (u.name || ""),
                        website: u.website || "",
                        address: u.address || "",
                        description: u.description || "",
                        size: u.size || ""
                    })
                }
            } catch (error) {
                console.error("Failed to fetch fresh user data:", error)
            }
        }

        fetchUserData()
    }, [user?.id, user?._id]) // Depend on ID change, not entire user object to avoid loops if not careful

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleLogoClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("userId", user.id || "")

        try {
            const response = await fetch("/api/user/upload-avatar", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()

            if (data.success) {
                await updateProfile({ avatar: data.url })
                toast({ title: "Thành công", description: "Logo doanh nghiệp đã được cập nhật." })
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setIsLoading(true)
        const userId = user._id || user.id

        // Normalize whitespace in all string fields
        const normalizedData = Object.entries(formData).reduce((acc, [key, value]) => {
            acc[key as keyof typeof formData] = normalizeWhitespace(value)
            return acc
        }, {} as typeof formData)

        try {
            // Update to API
            const response = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizedData)
            })

            const data = await response.json()

            if (response.ok) {
                // Update local context
                await updateProfile(normalizedData)
                // Update local state to reflect normalized text
                setFormData(normalizedData)
                toast({ title: "Thành công", description: "Thông tin doanh nghiệp đã được cập nhật." })
            } else {
                toast({ title: "Lỗi", description: data.error || "Có lỗi xảy ra", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Lỗi", description: "Không thể lưu thay đổi", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground">
                    Hồ sơ doanh nghiệp
                </h1>
                <p className="text-muted-foreground mt-1">
                    Cập nhật thông tin doanh nghiệp để thu hút ứng viên
                </p>
            </div>

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company">Thông tin doanh nghiệp</TabsTrigger>
                    <TabsTrigger value="representative">Thông tin người đại diện</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chỉnh sửa thông tin</CardTitle>
                            <CardDescription>Thông tin này sẽ hiển thị trên các tin tuyển dụng của bạn.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Logo Upload */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-dashed relative group cursor-pointer overflow-hidden flex-shrink-0"
                                        onClick={handleLogoClick}
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building className="h-8 w-8 text-muted-foreground group-hover:hidden" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[10px] font-medium text-center p-1">
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đổi Logo"}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileChange}
                                    />
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm">Logo doanh nghiệp</h4>
                                        <p className="text-xs text-muted-foreground">Khuyến nghị: Tỉ lệ 1:1, tối đa 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="companyName">Tên doanh nghiệp</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên doanh nghiệp"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="size">Quy mô doanh nghiệp</Label>
                                        <Select
                                            value={formData.size}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                                        >
                                            <SelectTrigger id="size">
                                                <SelectValue placeholder="Chọn quy mô doanh nghiệp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Dưới 10 nhân viên">Dưới 10 nhân viên</SelectItem>
                                                <SelectItem value="10-50 nhân viên">10-50 nhân viên</SelectItem>
                                                <SelectItem value="50-100 nhân viên">50-100 nhân viên</SelectItem>
                                                <SelectItem value="100-500 nhân viên">100-500 nhân viên</SelectItem>
                                                <SelectItem value="500-1000 nhân viên">500-1000 nhân viên</SelectItem>
                                                <SelectItem value="Trên 1000 nhân viên">Trên 1000 nhân viên</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Địa chỉ trụ sở</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Số nhà, đường, quận/huyện..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Giới thiệu về doanh nghiệp</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Mô tả ngắn gọn về doanh nghiệp, văn hóa, lĩnh vực hoạt động..."
                                        rows={5}
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="representative">
                    <UserProfileForm
                        title="Thông tin người đại diện"
                        description="Thông tin cá nhân của người quản lý tài khoản này"
                        showAvatar={false}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
