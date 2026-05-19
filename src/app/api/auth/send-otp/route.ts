import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import crypto from "crypto"
import { sendEmail } from "../../../../services/email.service"

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP for secure storage
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "Thiếu địa chỉ email" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // 1. Check in verified users
        let user: any = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })
        let isFromPending = false

        if (!user) {
            // 2. Check in pending users (new registrations)
            user = await prisma.pendingUser.findUnique({
                where: { email: normalizedEmail }
            })
            isFromPending = true
        }

        if (!user) {
            return NextResponse.json({ error: "Email không tồn tại trong hệ thống" }, { status: 404 })
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: "Tài khoản này đã được xác minh" }, { status: 400 })
        }

        const otp = generateOTP()
        const hashedOTP = hashOTP(otp)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        if (isFromPending) {
            await prisma.pendingUser.update({
                where: { email: normalizedEmail },
                data: {
                    emailOtp: hashedOTP,
                    emailOtpExpires: expiresAt
                }
            })
        } else {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailOtp: hashedOTP,
                    emailOtpExpires: expiresAt
                }
            })
        }

        // Send OTP email
        try {
            await sendEmail({
                to: normalizedEmail,
                subject: "Mã xác minh tài khoản GDU Career",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">Mã xác minh mới</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                      <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${user.name}!</h2>
                      <p style="color: #666;">Bạn vừa yêu cầu gửi lại mã xác minh:</p>
                      <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                      </div>
                      <p style="color: #999; font-size: 14px; text-align: center;">Mã này sẽ hết hạn sau <strong>5 phút</strong></p>
                    </div>
                  </div>
                `,
            })
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError)
            return NextResponse.json({ error: "Không thể gửi email. Vui lòng thử lại sau." }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "Mã OTP mới đã được gửi"
        })

    } catch (error) {
        console.error("Send OTP error:", error)
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
    }
}

