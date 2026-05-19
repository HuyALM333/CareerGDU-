"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Phone, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

function LoginContent() {
  const searchParams = useSearchParams()
  const isPending = searchParams.get("pending") === "true"
  const isApproved = searchParams.get("approved") === "true"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [needsTotpSetup, setNeedsTotpSetup] = useState(false)
  const [totpSetupData, setTotpSetupData] = useState<{
    qrCode: string
    secret: string
    recoveryCodes: string[]
    userId: string
  } | null>(null)
  const [setupStep, setSetupStep] = useState<"qr" | "verify" | "codes">("qr")
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Email Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (data.needs2FA) {
        if (data.needsTotpSetup) {
          // Admin needs to setup 2FA first
          setNeedsTotpSetup(true)
          await initTotpSetup(data.userId)
        } else {
          // Admin has 2FA enabled, ask for TOTP code
          setNeeds2FA(true)
          toast({
            title: "Xác thực 2 bước",
            description: "Vui lòng nhập mã từ Google Authenticator.",
          })
        }
      } else if (data.success && data.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        window.location.href = "/"
      } else if (data.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
      } else {
        setError(data.error || "Email hoặc mật khẩu không đúng")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize TOTP Setup
  const initTotpSetup = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/setup-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (data.success) {
        setTotpSetupData({ ...data, userId })
        setSetupStep("qr")
      } else {
        setError(data.error || "Không thể khởi tạo 2FA")
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi thiết lập 2FA")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify TOTP setup
  const handleVerifyTotpSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!totpSetupData) return
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/setup-totp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: totpSetupData.userId, token: otp }),
      })
      const data = await response.json()
      if (data.success) {
        setSetupStep("codes")
        toast({
          title: "Thành công!",
          description: "Đã bật xác thực 2 bước. Hãy lưu mã khôi phục!",
        })
      } else {
        setError(data.error || "Mã xác thực không đúng")
      }
    } catch (error) {
      setError("Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  // Complete setup and login
  const handleCompleteSetup = () => {
    setNeedsTotpSetup(false)
    setNeeds2FA(true)
    setOtp("")
    toast({
      title: "Thiết lập hoàn tất",
      description: "Vui lòng đăng nhập lại với mã từ Google Authenticator.",
    })
  }

  // 2FA Verification Handler
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: otp,
          useRecoveryCode
        }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        window.location.href = "/"
      } else {
        setError(data.error || "Mã xác thực không đúng")
      }
    } catch (error) {
      console.error("[v0] 2FA error:", error)
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
            {!needs2FA && !needsTotpSetup && (
              <button
                onClick={() => router.back()}
                className="absolute left-6 top-7 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all group/back"
                title="Quay lại"
              >
                <ArrowLeft className="h-6 w-6 transition-transform group-hover/back:-translate-x-1" />
              </button>
            )}
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              {needsTotpSetup
                ? (setupStep === "codes" ? "Lưu mã khôi phục" : "Thiết lập xác thực 2 bước")
                : needs2FA
                  ? "Xác thực 2 bước"
                  : "Chào mừng trở lại"}
            </CardTitle>
            <CardDescription className="text-base">
              {needsTotpSetup
                ? (setupStep === "qr"
                  ? "Quét mã QR bằng Google Authenticator"
                  : setupStep === "verify"
                    ? "Nhập mã 6 số từ ứng dụng"
                    : "Lưu các mã này ở nơi an toàn")
                : needs2FA
                  ? "Nhập mã từ Google Authenticator"
                  : "Đăng nhập để tiếp tục"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm p-4 rounded-xl mb-6 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                <div className="font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  Đang chờ phê duyệt
                </div>
                <p className="text-blue-600/80">Tài khoản của bạn đã được xác minh. Vui lòng chờ Admin kiểm tra và phê duyệt thông tin doanh nghiệp.</p>
              </div>
            )}

            {isApproved && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm p-4 rounded-xl mb-6 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Duyệt thành công
                </div>
                <p className="text-green-600/80">Tài khoản của bạn đã được Admin phê duyệt. Bây giờ bạn có thể đăng nhập để sử dụng tất cả tính năng.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95">
                <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            {/* TOTP Setup Flow */}
            {needsTotpSetup && totpSetupData && (
              <div className="space-y-5">
                {setupStep === "qr" && (
                  <>
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={totpSetupData.qrCode}
                        alt="QR Code for Google Authenticator"
                        className="w-48 h-48 border-2 border-gray-200 rounded-xl"
                      />
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          Hoặc nhập thủ công mã này vào ứng dụng:
                        </p>
                        <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono break-all">
                          {totpSetupData.secret}
                        </code>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSetupStep("verify")}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl"
                    >
                      Tiếp tục
                    </Button>
                  </>
                )}

                {setupStep === "verify" && (
                  <form onSubmit={handleVerifyTotpSetup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="setup-otp" className="text-gray-700 font-medium text-center block">
                        Nhập mã từ Google Authenticator
                      </Label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                          id="setup-otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-full px-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-center text-xl font-bold tracking-[0.5em] placeholder:text-gray-300"
                          required
                          maxLength={6}
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? "Đang xác thực..." : "Xác nhận"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setSetupStep("qr")}
                      className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </button>
                  </form>
                )}

                {setupStep === "codes" && (
                  <div className="space-y-5">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-xl">
                      <p className="font-semibold">⚠️ Quan trọng!</p>
                      <p>Lưu các mã này ở nơi an toàn. Bạn sẽ cần chúng nếu mất điện thoại.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {totpSetupData.recoveryCodes.map((code, index) => (
                        <code key={index} className="bg-gray-100 px-3 py-2 rounded text-center text-sm font-mono">
                          {code}
                        </code>
                      ))}
                    </div>
                    <Button
                      onClick={handleCompleteSetup}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl"
                    >
                      Đã lưu, tiếp tục đăng nhập
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Login Form */}
            {!needs2FA && !needsTotpSetup && (
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-1">
                    Hỗ trợ tất cả các loại email (Cá nhân, Doanh nghiệp, Giáo dục...)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400"
                      required
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-600 group-hover:border-red-400 transition-colors" />
                    <span className="text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link href="/forgot-password" className="text-red-600 hover:text-red-700 hover:underline font-medium transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
            )}

            {/* 2FA Verification Form */}
            {needs2FA && !needsTotpSetup && (
              <form onSubmit={handleVerify2FA} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700 font-medium text-center block">
                    {useRecoveryCode ? "Nhập mã khôi phục" : "Nhập mã từ Google Authenticator"}
                  </Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(useRecoveryCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ""))}
                      placeholder={useRecoveryCode ? "XXXXXXXX" : "000000"}
                      className="w-full px-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all text-center text-xl font-bold tracking-[0.3em] placeholder:text-gray-300 placeholder:tracking-normal"
                      required
                      maxLength={useRecoveryCode ? 8 : 6}
                      autoFocus
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {useRecoveryCode
                      ? "Nhập một trong các mã khôi phục đã lưu"
                      : "Mở Google Authenticator để lấy mã"}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? "Đang xác thực..." : "Xác nhận"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseRecoveryCode(!useRecoveryCode)
                      setOtp("")
                    }}
                    className="w-full text-sm text-gray-500 hover:text-red-600 transition-colors py-2"
                  >
                    {useRecoveryCode ? "Dùng mã từ Google Authenticator" : "Dùng mã khôi phục"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNeeds2FA(false)
                      setOtp("")
                      setUseRecoveryCode(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
