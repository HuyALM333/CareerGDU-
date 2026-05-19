"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { User as UserIcon, Mail, Phone, GraduationCap, Briefcase, Save, Upload, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Label } from "../../../components/ui/label"
import { useAuth } from "../../../lib/auth-context"
import { toast } from "../../../components/ui/use-toast"
import { normalizeWhitespace } from "../../../lib/utils"
import type { User } from "../../../types"

const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Canvas to Blob failed"))
          },
          "image/jpeg",
          0.8,
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

// Mapping of Majors to their corresponding Faculties (Official GDU List)
const MAJOR_FACULTY_MAP: Record<string, string> = {
  // Sức khỏe
  "Răng Hàm Mặt": "Sức khỏe",
  "Kỹ thuật phục hồi chức năng": "Sức khỏe",
  "Điều dưỡng": "Sức khỏe",
  // Công nghệ thông tin
  "Công nghệ thông tin": "Công nghệ thông tin",
  "Kỹ thuật phần mềm": "Công nghệ thông tin",
  "Mạng máy tính & Truyền thông dữ liệu": "Công nghệ thông tin",
  "Trí tuệ nhân tạo": "Công nghệ thông tin",
  // Truyền thông
  "Truyền thông đa phương tiện": "Truyền thông",
  "Công nghệ truyền thông": "Truyền thông",
  "Quan hệ công chúng": "Truyền thông",
  // Kinh doanh
  "Kinh doanh quốc tế": "Kinh doanh",
  "Kinh doanh thương mại": "Kinh doanh",
  "Thương mại điện tử": "Kinh doanh",
  // Quản trị - Quản lý
  "Quản trị kinh doanh": "Quản trị - Quản lý",
  "Marketing": "Quản trị - Quản lý",
  "Quản trị khách sạn": "Quản trị - Quản lý",
  "Quản trị dịch vụ du lịch & lữ hành": "Quản trị - Quản lý",
  "Logistics & Quản lý chuỗi cung ứng": "Quản trị - Quản lý",
  // Luật
  "Luật": "Luật",
  "Luật kinh tế": "Luật",
  // Khoa học xã hội & Ngôn ngữ quốc tế
  "Ngôn ngữ Anh": "Khoa học xã hội & Ngôn ngữ quốc tế",
  "Đông phương học": "Khoa học xã hội & Ngôn ngữ quốc tế",
  "Tâm lý học": "Khoa học xã hội & Ngôn ngữ quốc tế",
  "Ngôn ngữ Trung Quốc": "Khoa học xã hội & Ngôn ngữ quốc tế",
  // Tài chính ngân hàng
  "Tài chính ngân hàng": "Tài chính ngân hàng",
  "Công nghệ tài chính": "Tài chính ngân hàng",
  "Kế toán": "Tài chính ngân hàng",
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    major: "",
    faculty: "",
    cohort: "",
  })

  // Function to initialize form data from user object
  const initFormData = (userData: User | null) => {
    if (userData) {
      const major = (userData.major || "").trim()
      const faculty = (userData.faculty || (major ? MAJOR_FACULTY_MAP[major] : "") || "").trim()
      setFormData({
        name: (userData.name || "").trim(),
        email: (userData.email || "").trim(),
        phone: (userData.phone || "").trim(),
        studentId: (userData.studentId || "").trim(),
        major: major,
        faculty: faculty,
        cohort: (userData.cohort || "").trim(),
      })
    }
  }

  // Synchronize formData with user data when context loads or updates
  useEffect(() => {
    initFormData(user)
  }, [user])

  const handleCancel = () => {
    initFormData(user)
    setIsEditing(false)
    setPhoneError("")
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "major") {
      const matchedFaculty = MAJOR_FACULTY_MAP[value]
      setFormData({
        ...formData,
        [name]: value,
        faculty: matchedFaculty || "" // Default to empty if no match, allow manual selection
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSave = async () => {
    if (formData.phone && !/^0\d{9,10}$/.test(formData.phone)) {
      setPhoneError("Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số")
      return
    }

    setIsSaving(true)
    try {
      // Normalize string fields
      const normalizedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key as keyof typeof formData] = normalizeWhitespace(value)
        return acc
      }, {} as typeof formData)

      console.log("[ProfilePage] Saving normalized data:", normalizedData)
      await updateProfile(normalizedData)

      setFormData(normalizedData)
      setIsEditing(false)
      toast({ title: "Đã lưu", description: "Thông tin hồ sơ đã được cập nhật." })
    } catch (err: any) {
      console.error("[ProfilePage] Save crash:", err)
      toast({
        title: "Lỗi lưu dữ liệu",
        description: err.message || "Máy chủ từ chối cập nhật. Vui lòng kiểm tra lại thông tin.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !user.id) return

    setIsUploading(true)
    try {
      // Resize image before uploading
      const resizedBlob = await resizeImage(file)
      const resizedFile = new File([resizedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("file", resizedFile)
      formData.append("userId", user.id)

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
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold overflow-hidden border-2 border-background shadow-md">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <img src="/default-avatar.png" alt="Default Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Upload className="h-6 w-6 text-white" />}
              </div>
              <button
                className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg hover:bg-secondary/90 transition-colors z-10"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.role === "student"
                  ? "Sinh viên"
                  : user?.role === "employer"
                    ? "Nhà tuyển dụng"
                    : "Quản trị viên"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted cursor-not-allowed opacity-70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value
                    // Only allow digits
                    if (/\D/.test(val)) return

                    setFormData({ ...formData, phone: val })

                    if (val.length > 0) {
                      if (!val.startsWith('0')) {
                        setPhoneError("Số điện thoại phải bắt đầu bằng số 0")
                      } else if (val.length < 10 || val.length > 11) {
                        setPhoneError("Số điện thoại phải có 10-11 số (hiện có " + val.length + " số)")
                      } else {
                        setPhoneError("")
                      }
                    } else {
                      setPhoneError("")
                    }
                  }}
                  disabled={!isEditing}
                  className={phoneError ? "w-full pl-10 pr-4 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-muted disabled:cursor-not-allowed" : "w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"}
                />
                {phoneError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{phoneError}</p>}
              </div>
            </div>

            {user?.role === "student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã số sinh viên</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Ngành học</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn ngành học</option>
                      <optgroup label="Sức khỏe">
                        <option value="Răng Hàm Mặt">Răng Hàm Mặt</option>
                        <option value="Kỹ thuật phục hồi chức năng">Kỹ thuật phục hồi chức năng</option>
                        <option value="Điều dưỡng">Điều dưỡng</option>
                      </optgroup>
                      <optgroup label="Công nghệ thông tin">
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                        <option value="Mạng máy tính & Truyền thông dữ liệu">Mạng máy tính</option>
                        <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
                      </optgroup>
                      <optgroup label="Truyền thông">
                        <option value="Truyền thông đa phương tiện">Truyền thông đa phương tiện</option>
                        <option value="Công nghệ truyền thông">Công nghệ truyền thông</option>
                        <option value="Quan hệ công chúng">Quan hệ công chúng</option>
                      </optgroup>
                      <optgroup label="Kinh doanh">
                        <option value="Kinh doanh quốc tế">Kinh doanh quốc tế</option>
                        <option value="Kinh doanh thương mại">Kinh doanh thương mại</option>
                        <option value="Thương mại điện tử">Thương mại điện tử</option>
                      </optgroup>
                      <optgroup label="Quản trị - Quản lý">
                        <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Quản trị khách sạn">Quản trị khách sạn</option>
                        <option value="Quản trị dịch vụ du lịch & lữ hành">Du lịch</option>
                        <option value="Logistics & Quản lý chuỗi cung ứng">Logistics</option>
                      </optgroup>
                      <optgroup label="Luật">
                        <option value="Luật">Luật</option>
                        <option value="Luật kinh tế">Luật kinh tế</option>
                      </optgroup>
                      <optgroup label="Khoa học xã hội & Ngôn ngữ quốc tế">
                        <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
                        <option value="Đông phương học">Đông phương học</option>
                        <option value="Tâm lý học">Tâm lý học</option>
                        <option value="Ngôn ngữ Trung Quốc">Ngôn ngữ Trung Quốc</option>
                      </optgroup>
                      <optgroup label="Tài chính ngân hàng">
                        <option value="Tài chính ngân hàng">Tài chính ngân hàng</option>
                        <option value="Công nghệ tài chính">Công nghệ tài chính</option>
                        <option value="Kế toán">Kế toán</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty">Khoa / Viện</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="faculty"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      disabled={true} // Locked - derived from Major
                      className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted cursor-not-allowed opacity-70"
                    >
                      <option value="">Chọn khoa / viện</option>
                      <option value="Sức khỏe">Sức khỏe</option>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Truyền thông">Truyền thông</option>
                      <option value="Kinh doanh">Kinh doanh</option>
                      <option value="Quản trị - Quản lý">Quản trị - Quản lý</option>
                      <option value="Luật">Luật</option>
                      <option value="Khoa học xã hội & Ngôn ngữ quốc tế">KHXH & Ngôn ngữ quốc tế</option>
                      <option value="Tài chính ngân hàng">Tài chính ngân hàng</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cohort">Khóa</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="cohort"
                      name="cohort"
                      value={formData.cohort}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn khóa</option>
                      <option value="K14">K14</option>
                      <option value="K15">K15</option>
                      <option value="K16">K16</option>
                      <option value="K17">K17</option>
                      <option value="K18">K18</option>
                      <option value="K19">K19</option>
                      <option value="K20">K20</option>
                      <option value="K21">K21</option>
                      <option value="K22">K22</option>
                      <option value="K23">K23</option>
                      <option value="K24">K24</option>
                      <option value="K25">K25</option>
                      <option value="Khác">Khác / Cựu SV</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
