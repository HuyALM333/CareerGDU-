import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { sendEmail } from "../../../../services/email.service"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Vui lòng nhập email" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })

        if (!user) {
            return NextResponse.json({ error: "Email này chưa được đăng ký tài khoản." }, { status: 404 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes validity

        // Save OTP to user (using fields from schema.prisma)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: otp,
                resetTokenExpiry: resetExpires
            }
        })

        // Send email with OTP
        const emailResult = await sendEmail({
            to: normalizedEmail,
            subject: "Mã xác nhận khôi phục mật khẩu - GDU Career",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d32f2f; text-align: center;">Mã xác nhận</h2>
                    <p>Xin chào ${user.name},</p>
                    <p>Bạn đang thực hiện yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f5f5f5; color: #333; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; border: 1px solid #ccc;">${otp}</span>
                    </div>
                    <p style="text-align: center; color: #666;">Mã này sẽ hết hạn sau 15 phút.</p>
                    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                </div>
            `
        })

        if (!emailResult.success) {
            console.error("Failed to send email:", emailResult.error)
            return NextResponse.json({ error: `Lỗi gửi email: ${JSON.stringify(emailResult.error)}` }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "OTP sent" })

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 })
    }
}

