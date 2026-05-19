import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { sendEmail } from "@/services/email.service"

// Request OTP for password change
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: "Thiếu thông tin người dùng" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordChangeOtp: otp,
                passwordChangeOtpExpires: otpExpires
            }
        })

        // Send OTP email
        await sendEmail({
            to: user.email,
            subject: "[GDU Career] Mã xác thực đổi mật khẩu",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:gdu-logo" alt="GDU Logo" style="height: 60px; width: auto;">
                    </div>
                    <h2 style="color: #d32f2f; text-align: center;">Mã xác thực đổi mật khẩu</h2>
                    <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
                    <p>Bạn đang yêu cầu đổi mật khẩu tài khoản. Vui lòng sử dụng mã OTP dưới đây để xác nhận:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f5f5f5; color: #333; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; border: 1px solid #ccc;">${otp}</span>
                    </div>
                    <p style="text-align: center; color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
                    <p style="color: #d32f2f; font-weight: bold; font-size: 13px;">Lưu ý: Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ quản trị viên.</p>
                </div>
            `
        })

        return NextResponse.json({
            success: true,
            message: "Mã OTP đã được gửi tới email của bạn"
        })

    } catch (error) {
        console.error("[API] Request password change OTP error:", error)
        return NextResponse.json(
            { error: "Không thể gửi mã OTP. Vui lòng thử lại." },
            { status: 500 }
        )
    }
}

