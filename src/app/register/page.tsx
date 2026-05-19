"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap, BookOpen, ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student" as "student" | "employer",
    studentId: "",
    major: "",
    // Employer Fields
    contactPerson: "",
    companyName: "",
    companyType: "",
    companySize: "",
    foreignCapital: false,
    province: "",
    otherProvince: "",
    industry: "",
    address: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAllMajors, setShowAllMajors] = useState(false)
  const [customMajor, setCustomMajor] = useState("")
  const router = useRouter()

  const FEATURED_GDU_MAJORS = [
    "Công nghệ thông tin",
    "Trí tuệ nhân tạo",
    "Marketing",
    "Tài chính ngân hàng",
    "Kế toán",
    "Ngôn ngữ Anh",
  ]

  const GDU_MAJOR_GROUPS = [
    {
      label: "Công nghệ thông tin",
      items: [
        "Công nghệ thông tin",
        "Trí tuệ nhân tạo",
        "Mạng máy tính và truyền thông dữ liệu",
        "Kỹ thuật phần mềm",
      ],
    },
    {
      label: "Khoa học sức khỏe",
      items: [
        "Răng Hàm Mặt",
        "Kỹ thuật phục hồi chức năng",
        "Điều dưỡng",
      ],
    },
    {
      label: "Khoa học xã hội và Ngôn ngữ",
      items: [
        "Tâm lý học",
        "Ngôn ngữ Trung Quốc",
        "Ngôn ngữ Anh",
        "Luật",
        "Luật Kinh tế",
        "Đông Phương học",
      ],
    },
    {
      label: "Quản trị Marketing",
      items: [
        "Quản trị khách sạn",
        "Quản trị kinh doanh",
        "Quản trị dịch vụ du lịch lữ hành",
        "Marketing",
      ],
    },
    {
      label: "Tài chính thương mại",
      items: [
        "Thương mại điện tử",
        "Tài chính ngân hàng",
        "Logistics",
        "Kinh doanh thương mại",
        "Kinh doanh quốc tế",
        "Kế toán",
        "Công nghệ tài chính",
      ],
    },
    {
      label: "Truyền thông số",
      items: [
        "Truyền thông đa phương tiện",
        "Quan hệ công chúng",
        "Công nghệ truyền thông",
      ],
    },
  ]

  const OTHER_MAJOR_VALUE = "__other_major__"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) return setError("Vui lòng nhập họ và tên")
    if (!formData.email.trim()) return setError("Vui lòng nhập email")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return setError("Vui lòng nhập địa chỉ email hợp lệ")
    if (formData.role === "student") {
      if (formData.phone && !/^0\d{9,10}$/.test(formData.phone)) return setError("Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số")
      if (!formData.studentId.trim()) return setError("Vui lòng nhập MSSV")
      if (!formData.major) return setError("Vui lòng chọn ngành học")
      if (formData.major === OTHER_MAJOR_VALUE && !customMajor.trim()) {
        return setError("Vui lòng nhập ngành học")
      }
    }

    // Employer Validation
    if (formData.role === "employer") {
      if (!formData.contactPerson.trim()) return setError("Vui lòng nhập tên người liên hệ")
      if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại")
      if (!/^0\d{9,10}$/.test(formData.phone)) return setError("Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số")
      if (!formData.companyType) return setError("Vui lòng chọn loại hình doanh nghiệp")
      if (!formData.companySize) return setError("Vui lòng chọn quy mô doanh nghiệp")
      if (!formData.companyName.trim()) return setError("Vui lòng nhập tên doanh nghiệp")
      if (!formData.province) return setError("Vui lòng chọn tỉnh/thành")
      if (formData.province === "OTHER" && !formData.otherProvince.trim()) return setError("Vui lòng nhập tên tỉnh/thành")
      if (!formData.industry) return setError("Vui lòng chọn lĩnh vực")
      if (!formData.address.trim()) return setError("Vui lòng nhập địa chỉ")
    }

    if (formData.password !== formData.confirmPassword) return setError("Mật khẩu xác nhận không khớp")
    if (formData.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự")

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          studentId: formData.studentId.trim(),
          major: formData.major === OTHER_MAJOR_VALUE ? customMajor.trim() : formData.major.trim(),
          province: formData.province === "OTHER" ? formData.otherProvince.trim() : formData.province,
          // Employer trims
          contactPerson: formData.contactPerson.trim(),
          companyName: formData.companyName.trim(),
          address: formData.address.trim(),
        }),
      })

      const data = await response.json()

      console.log("Register response:", data)

      if (data.success) {
        if (data.needsVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          router.push("/login")
        }
      } else {
        setError(data.error || "Email đã được sử dụng")
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <img
              src="/gdu-logo.png"
              alt="GDU Logo"
              className="h-24 w-auto object-contain"
            />
          </Link>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 relative">
            <button
              onClick={() => router.back()}
              className="absolute left-6 top-7 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all group/back"
              title="Quay lại"
            >
              <ArrowLeft className="h-6 w-6 transition-transform group-hover/back:-translate-x-1" />
            </button>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Đăng ký tài khoản</CardTitle>
            <CardDescription className="text-base">Mở khóa cơ hội nghề nghiệp của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95">
                <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleEmailRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 font-medium">Bạn là <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as "student" | "employer" })}
                >
                  <SelectTrigger className="w-full px-4 py-2.5 h-[46px] border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-gray-900">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Sinh viên</SelectItem>
                    <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Họ và tên <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  Hỗ trợ tất cả các loại email (Cá nhân, Doanh nghiệp, Giáo dục...)
                </p>
              </div>

              {/* Phone Field - Hide for employer as it's in the business form below (or keep here?) - Actually design shows it inside business form. 
                    Let's hide it here if employer, show if student.
                    Or better, only show here if Student.
                */}
              {formData.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Số điện thoại</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {formData.role === "student" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-gray-700 font-medium">MSSV <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        inputMode="numeric"
                        value={formData.studentId}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setFormData(prev => ({ ...prev, studentId: value }));
                        }}
                        placeholder="Nhập MSSV"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="major" className="text-gray-700 font-medium">
                      Ngành học <span className="text-red-500">*</span>
                    </Label>

                    {!showAllMajors ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowAllMajors(true)}
                          className={`w-full relative text-left pl-11 pr-10 py-2.5 h-[46px] border rounded-xl bg-white transition-all ${formData.major
                              ? "border-gray-200 text-gray-900"
                              : "border-gray-200 text-gray-400"
                            } focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500`}
                        >
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <span className="block truncate">
                            {formData.major === OTHER_MAJOR_VALUE
                              ? "Ngành khác (tự nhập)"
                              : formData.major || "Chọn ngành học"}
                          </span>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </button>

                        {formData.major === OTHER_MAJOR_VALUE && (
                          <div className="mt-2">
                            <input
                              id="customMajor"
                              name="customMajor"
                              type="text"
                              value={customMajor}
                              onChange={(e) => setCustomMajor(e.target.value)}
                              placeholder="Nhập ngành học nếu chưa kịp cập nhật"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowAllMajors(false)}
                            className="w-full px-4 py-3 border-b border-gray-100 bg-gray-50 text-left flex items-center justify-between"
                          >
                            <span className="text-sm font-semibold text-gray-900">Chọn ngành học</span>
                            <ChevronDown className="h-4 w-4 text-gray-400 rotate-180" />
                          </button>

                          <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-4">
                            {GDU_MAJOR_GROUPS.map((group) => (
                              <div key={group.label}>
                                <p className="text-sm font-bold text-gray-900 mb-2">{group.label}</p>
                                <div className="space-y-1">
                                  {group.items.map((major) => (
                                    <button
                                      key={major}
                                      type="button"
                                      onClick={() => {
                                        if (formData.major !== major) {
                                          setFormData((prev) => ({
                                            ...prev,
                                            major,
                                          }))
                                          setCustomMajor("")
                                        }
                                        setShowAllMajors(false)
                                      }}
                                      className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${formData.major === major
                                          ? "bg-red-50 text-red-700 border border-red-200"
                                          : "hover:bg-gray-50 border border-transparent text-gray-700"
                                        }`}
                                    >
                                      {major}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}

                            <div className="border-t border-gray-100 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (formData.major !== OTHER_MAJOR_VALUE) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      major: OTHER_MAJOR_VALUE,
                                    }))
                                  }
                                  setShowAllMajors(false)
                                }}
                                className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${formData.major === OTHER_MAJOR_VALUE
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "hover:bg-gray-50 border border-transparent text-gray-700"
                                  }`}
                              >
                                Ngành khác (tự nhập)
                              </button>
                            </div>
                          </div>
                        </div>

                        {formData.major && formData.major !== OTHER_MAJOR_VALUE && (
                          <span className="text-xs text-gray-500">Đã chọn: {formData.major}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.role === "employer" && (
                <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Thông Tin Doanh Nghiệp</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Person */}
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-gray-700 font-medium">Người liên hệ <span className="text-red-500">*</span></Label>
                        <input
                          id="contactPerson"
                          name="contactPerson"
                          type="text"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="Nhập tên người liên hệ"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        />
                      </div>

                      {/* Phone - required for employer */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Số điện thoại <span className="text-red-500">*</span></Label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Nhập số điện thoại"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Company Type */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Loại hình Doanh nghiệp <span className="text-red-500">*</span></Label>
                        <Select value={formData.companyType} onValueChange={(val) => setFormData({ ...formData, companyType: val })}>
                          <SelectTrigger className="w-full h-[46px] rounded-xl border-gray-200">
                            <SelectValue placeholder="Chọn loại hình doanh nghiệp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TNHH">Doanh nghiệp TNHH</SelectItem>
                            <SelectItem value="CP">Doanh nghiệp Cổ phần</SelectItem>
                            <SelectItem value="NN">Doanh nghiệp Nhà nước</SelectItem>
                            <SelectItem value="DTVN">Doanh nghiệp tư nhân</SelectItem>
                            <SelectItem value="LDOANH">Liên doanh</SelectItem>
                            <SelectItem value="1TV">Doanh nghiệp TNHH 1 thành viên</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Company Size */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Quy mô Doanh nghiệp <span className="text-red-500">*</span></Label>
                        <Select value={formData.companySize} onValueChange={(val) => setFormData({ ...formData, companySize: val })}>
                          <SelectTrigger className="w-full h-[46px] rounded-xl border-gray-200">
                            <SelectValue placeholder="Chọn quy mô doanh nghiệp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_10">Dưới 10 nhân viên</SelectItem>
                            <SelectItem value="10_50">10 - 50 nhân viên</SelectItem>
                            <SelectItem value="50_100">50 - 100 nhân viên</SelectItem>
                            <SelectItem value="100_500">100 - 500 nhân viên</SelectItem>
                            <SelectItem value="500_1000">500 - 1000 nhân viên</SelectItem>
                            <SelectItem value="over_1000">Trên 1000 nhân viên</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="foreignCapital"
                        name="foreignCapital"
                        checked={formData.foreignCapital}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      />
                      <Label htmlFor="foreignCapital" className="font-normal cursor-pointer">Vốn đầu tư nước ngoài</Label>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor="companyName" className="text-gray-700 font-medium">Tên Doanh nghiệp <span className="text-red-500">*</span></Label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Nhập tên doanh nghiệp"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Province */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Tỉnh/Thành <span className="text-red-500">*</span></Label>
                        <Select value={formData.province} onValueChange={(val) => setFormData({ ...formData, province: val })}>
                          <SelectTrigger className="w-full h-[46px] rounded-xl border-gray-200">
                            <SelectValue placeholder="Chọn tỉnh/thành" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HCM">Hồ Chí Minh</SelectItem>
                            <SelectItem value="HN">Hà Nội</SelectItem>
                            <SelectItem value="DN">Đà Nẵng</SelectItem>
                            <SelectItem value="BD">Bình Dương</SelectItem>
                            <SelectItem value="DNAI">Đồng Nai</SelectItem>
                            <SelectItem value="CT">Cần Thơ</SelectItem>
                            <SelectItem value="OTHER">Khác (Tỉnh khác)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Other Province Input - Conditional */}
                      {formData.province === "OTHER" && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                          <Label htmlFor="otherProvince" className="text-gray-700 font-medium">Nhập tên Tỉnh/Thành <span className="text-red-500">*</span></Label>
                          <input
                            id="otherProvince"
                            name="otherProvince"
                            type="text"
                            value={formData.otherProvince}
                            onChange={handleChange}
                            placeholder="Ví dụ: Long An, Tiền Giang..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                            required
                          />
                        </div>
                      )}

                      {/* Industry */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Lĩnh vực doanh nghiệp <span className="text-red-500">*</span></Label>
                        <Select value={formData.industry} onValueChange={(val) => setFormData({ ...formData, industry: val })}>
                          <SelectTrigger className="w-full h-[46px] rounded-xl border-gray-200">
                            <SelectValue placeholder="Chọn lĩnh vực doanh nghiệp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT">Công nghệ thông tin</SelectItem>
                            <SelectItem value="FINANCE">Tài chính / Ngân hàng</SelectItem>
                            <SelectItem value="EDUCATION">Giáo dục / Đào tạo</SelectItem>
                            <SelectItem value="MARKETING">Marketing / Truyền thông</SelectItem>
                            <SelectItem value="HOSPITALITY">Du lịch / Khách sạn</SelectItem>
                            <SelectItem value="CONSTRUCTION">Xây dựng</SelectItem>
                            <SelectItem value="OTHER">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor="address" className="text-gray-700 font-medium">Địa chỉ <span className="text-red-500">*</span></Label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      />
                    </div>

                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <Label htmlFor="terms" className="font-normal cursor-pointer text-sm">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </Link>{" "}
                  của GDU Career
                </Label>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
