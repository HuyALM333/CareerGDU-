"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setStep(2)
                toast({
                    title: "Mã OTP đã được gửi",
                    description: "Vui lòng kiểm tra email của bạn.",
                })
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Có lỗi xảy ra.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Không thể kết nối đến máy chủ.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (otp.length !== 6) {
            toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ 6 số OTP.", variant: "destructive" })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/verify-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            const data = await response.json()

            if (data.success) {
                setStep(3)
                toast({
                    title: "OTP Hợp lệ",
                    description: "Vui lòng nhập mật khẩu mới.",
                })
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Mã OTP không đúng hoặc đã hết hạn.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Có lỗi xảy ra.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp.", variant: "destructive" })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSuccess(true)
                toast({
                    title: "Thành công",
                    description: "Đổi mật khẩu thành công!",
                })
                setTimeout(() => router.push("/login"), 3000)
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Đã xảy ra lỗi khi đổi mật khẩu.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Có lỗi xảy ra.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12">
                <div className="w-full max-w-md text-center space-y-4 py-8">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-4 outline-green-50">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu thành công!</h2>
                    <p className="text-gray-600">
                        Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
                    </p>
                    <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                        <Link href="/login">Đăng nhập ngay</Link>
                    </Button>
                </div>
            </div>
        )
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
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                            {step === 1 && "Quên mật khẩu?"}
                            {step === 2 && "Nhập mã xác thực"}
                            {step === 3 && "Đặt lại mật khẩu"}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {step === 1 && "Nhập email để nhận mã xác thực (OTP)"}
                            {step === 2 && `Nhập mã OTP 6 số đã gửi đến ${email}`}
                            {step === 3 && "Nhập mật khẩu mới cho tài khoản của bạn"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">Email đăng ký</Label>
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
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-center py-4 gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                className="w-10 h-12 text-center text-xl font-bold border rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-white"
                                                value={otp[index] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (!/^\d*$/.test(val)) return

                                                    const newOtp = otp.split('')
                                                    while (newOtp.length < 6) newOtp.push('')
                                                    newOtp[index] = val
                                                    const otpStr = newOtp.join('').slice(0, 6)
                                                    setOtp(otpStr)

                                                    // Auto focus next
                                                    if (val && index < 5) {
                                                        const nextInput = document.querySelector(`input[name='otp-${index + 1}']`) as HTMLInputElement
                                                        if (nextInput) nextInput.focus()
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                        const prevInput = document.querySelector(`input[name='otp-${index - 1}']`) as HTMLInputElement
                                                        if (prevInput) prevInput.focus()
                                                    }
                                                }}
                                                name={`otp-${index}`}
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Đang xác thực..." : "Tiếp tục"}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Gửi lại mã OTP
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ít nhất 6 ký tự"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center border-t border-gray-100 p-6 bg-gray-50/50">
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại đăng nhập
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
