"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, Database, RefreshCw, Check, AlertCircle, Lock, ShieldCheck, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { UserProfileForm } from "@/components/dashboard/user-profile-form"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [passwordMessage, setPasswordMessage] = useState("")

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus("loading")
    setImportMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/csv/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImportStatus("success")
        setImportMessage(`Đã import ${result.data.count} bản ghi thành công`)
      } else {
        setImportStatus("error")
        setImportMessage(result.error)
      }
    } catch (error) {
      setImportStatus("error")
      setImportMessage("Lỗi khi import file")
    }
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/csv/export?type=${type}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_export_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  // Request OTP for admin password change
  const handleRequestOtp = async () => {
    setOtpLoading(true)
    try {
      const response = await fetch("/api/user/request-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || user?.id }),
      })

      const result = await response.json()

      if (result.success) {
        setOtpSent(true)
        toast({
          title: "Mã OTP đã được gửi",
          description: "Vui lòng kiểm tra email của bạn để lấy mã xác thực.",
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể gửi mã OTP",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Vui lòng thử lại sau.",
        variant: "destructive"
      })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleChangePassword = async () => {
    // Reset status
    setPasswordStatus("idle")
    setPasswordMessage("")

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("error")
      setPasswordMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus("error")
      setPasswordMessage("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 6) {
      setPasswordStatus("error")
      setPasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    // Admin requires OTP
    if (user?.role === "admin" && !otp) {
      setPasswordStatus("error")
      setPasswordMessage("Quản trị viên cần nhập mã OTP để xác thực")
      return
    }

    setPasswordStatus("loading")

    const payload = {
      userId: user?._id || user?.id,
      currentPassword,
      newPassword,
      otp: user?.role === "admin" ? otp : undefined,
    }

    console.log("Sending change password request:", payload)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setPasswordStatus("success")
        setPasswordMessage("Đổi mật khẩu thành công!")
        // Clear form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setOtp("")
        setOtpSent(false)
      } else {
        setPasswordStatus("error")
        setPasswordMessage(result.error || "Đổi mật khẩu thất bại")
      }
    } catch (error) {
      setPasswordStatus("error")
      setPasswordMessage("Lỗi kết nối. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-8 p-1 sm:p-2 lg:p-4 max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">Cài đặt</h1>
        <p className="text-lg text-muted-foreground font-medium">Quản lý cài đặt tài khoản và hệ thống của bạn</p>
      </div>

      <UserProfileForm
        title="Thông tin tài khoản"
        description="Cập nhật thông tin cá nhân của quản trị viên"
      />

      {/* Security Settings */}
      <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900 tracking-tight">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Lock className="h-6 w-6" />
            </div>
            Bảo mật
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500 mt-1 ml-11">Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-8">
          {passwordStatus !== "idle" && (
            <div
              className={`p-5 rounded-2xl flex items-center gap-4 border transition-all duration-300 ${passwordStatus === "loading"
                ? "bg-blue-50/50 text-blue-700 border-blue-100"
                : passwordStatus === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
                }`}
            >
              <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                {passwordStatus === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
                {passwordStatus === "error" && <AlertCircle className="h-5 w-5" />}
                {passwordStatus === "success" && <Check className="h-5 w-5" />}
              </div>
              <span className="font-bold">{passwordStatus === "loading" ? "Đang xử lý..." : passwordMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="current-password" title="Mật khẩu hiện tại" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Mật khẩu hiện tại</Label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" title="Mật khẩu mới" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Mật khẩu mới</Label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirm-password" title="Xác nhận mật khẩu" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Xác nhận mật khẩu</Label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Admin 2FA OTP Section */}
          {user?.role === "admin" && (
            <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Xác thực 2 lớp (2FA)</p>
                  <p className="text-sm text-gray-500">Quản trị viên cần xác thực OTP để đổi mật khẩu</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="otp" className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">Mã OTP</Label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={otpSent ? "Nhập 6 số OTP" : "Nhấn nút bên cạnh để nhận mã"}
                    disabled={!otpSent}
                    maxLength={6}
                    className="w-full px-5 py-3.5 bg-white border border-blue-200 rounded-2xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-center text-lg tracking-[0.3em] disabled:bg-gray-100"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRequestOtp}
                    disabled={otpLoading || otpSent}
                    className="h-[54px] px-6 rounded-2xl font-bold border-blue-200 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                  >
                    {otpLoading ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Đang gửi...</>
                    ) : otpSent ? (
                      <><Check className="h-4 w-4 mr-2" />Đã gửi OTP</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" />Gửi mã OTP</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleChangePassword}
            disabled={passwordStatus === "loading"}
            className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
          >
            {passwordStatus === "loading" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Lưu thay đổi mật khẩu"
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="text-2xl font-black text-gray-900 tracking-tight ml-1">Thông báo</CardTitle>
          <CardDescription className="text-sm font-medium text-gray-500 mt-1 ml-1">Tùy chỉnh cách thức nhận thông báo hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-50 px-8">
          {[
            {
              key: 'email',
              label: 'Thông báo Email',
              desc: 'Gửi cập nhật quan trọng qua hòm thư',
              checked: user?.notificationSettings?.email ?? true
            },
            {
              key: 'push',
              label: 'Thông báo Push',
              desc: 'Hiển thị trên trình duyệt ngay lập tức',
              checked: user?.notificationSettings?.push ?? false
            },
            {
              key: 'newJobs',
              label: 'Việc làm mới',
              desc: 'Cập nhật khi có công việc chuyển môn phù hợp',
              checked: user?.notificationSettings?.newJobs ?? true
            }
          ].map((item) => (
            <label
              key={item.key}
              htmlFor={`notif-${item.key}`}
              className="flex items-center justify-between py-6 group cursor-pointer"
            >
              <div className="space-y-1">
                <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-sm font-medium text-gray-400">{item.desc}</p>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  id={`notif-${item.key}`}
                  type="checkbox"
                  className="sr-only peer"
                  checked={item.checked}
                  onChange={async (e) => {
                    const newValue = e.target.checked
                    try {
                      const success = await updateProfile({
                        notificationSettings: {
                          email: user?.notificationSettings?.email ?? true,
                          push: user?.notificationSettings?.push ?? false,
                          newJobs: user?.notificationSettings?.newJobs ?? true,
                          [item.key]: newValue
                        }
                      })

                      if (success) {
                        toast({
                          title: "Thành công",
                          description: `Đã ${newValue ? "bật" : "tắt"} ${item.label.toLowerCase()}`,
                        })
                      } else {
                        throw new Error("Update failed")
                      }
                    } catch (error) {
                      toast({
                        title: "Lỗi",
                        description: "Không thể cập nhật cài đặt thông báo",
                        variant: "destructive"
                      })
                    }
                  }}
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Data Management - Admin Only */}
      {user?.role === "admin" && (
        <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-gray-50">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900 tracking-tight">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Database className="h-6 w-6" />
              </div>
              Quản lý dữ liệu
            </CardTitle>
            <CardDescription className="text-sm font-medium text-gray-500 mt-1 ml-11">Xuất nhập liệu CSV và giám sát cơ sở dữ liệu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 px-8">
            {importStatus !== "idle" && (
              <div
                className={`p-5 rounded-2xl flex items-center gap-4 border ${importStatus === "loading"
                  ? "bg-blue-50/50 text-blue-700 border-blue-100"
                  : importStatus === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {importStatus === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
                  {importStatus === "success" && <Check className="h-5 w-5" />}
                  {importStatus === "error" && <AlertCircle className="h-5 w-5" />}
                </div>
                <span className="font-bold">{importStatus === "loading" ? "Đang xử lý..." : importMessage}</span>
              </div>
            )}

            {/* Import Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <Label className="text-lg font-black text-gray-800">Nhập dữ liệu CSV</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { key: 'jobs', label: 'Việc làm' },
                  { key: 'reviews', label: 'Đánh giá' },
                  { key: 'users', label: 'Người dùng' }
                ].map((input) => (
                  <div key={input.key} className="space-y-3">
                    <Label htmlFor={`import-${input.key}`} className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                      Download {input.label}
                    </Label>
                    <label className="flex flex-col items-center justify-center gap-3 px-4 py-8 border-2 border-dashed border-gray-100 rounded-3xl cursor-pointer hover:bg-gray-50 hover:border-primary/30 transition-all group">
                      <div className="p-3 bg-gray-50 group-hover:bg-primary/10 rounded-2xl transition-colors">
                        <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">Chọn file .CSV</span>
                      <input
                        id={`import-${input.key}`}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileImport(e, input.key)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Section */}
            <div className="pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <Label className="text-lg font-black text-gray-800">Xuất dữ liệu hệ thống</Label>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'jobs', label: 'Việc làm' },
                  { key: 'reviews', label: 'Đánh giá' },
                  { key: 'users', label: 'Người dùng' }
                ].map((exp) => (
                  <Button
                    key={exp.key}
                    variant="outline"
                    onClick={() => handleExport(exp.key)}
                    className="h-11 px-6 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <Download className="h-4 w-4 mr-2 text-primary" />
                    {exp.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Database Info - MySQL/Prisma */}
            <div className="pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <Label className="text-lg font-black text-gray-800">Cơ sở dữ liệu MySQL</Label>
              </div>
              <div className="bg-gray-900 shadow-2xl shadow-gray-900/10 p-6 rounded-3xl space-y-3 font-mono text-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                <p className="flex items-center gap-3">
                  <span className="text-gray-500 font-black min-w-[80px]">ENGINE</span>
                  <span className="text-blue-400 font-bold">MySQL Server (via Prisma)</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-gray-500 font-black min-w-[80px]">DATABASE</span>
                  <span className="text-purple-400 font-bold">gdu_career</span>
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-gray-500 font-black min-w-[80px]">STATUS</span>
                  <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-500 text-xs font-black uppercase tracking-widest">Active & Connected</span>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  )
}

