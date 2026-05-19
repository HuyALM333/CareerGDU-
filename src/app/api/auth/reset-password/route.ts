import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json()

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Find user with matching email, OTP and valid expiration
        const user = await prisma.user.findFirst({
            where: {
                email: normalizedEmail,
                resetToken: otp,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: "Mã OTP không chính xác hoặc đã hết hạn" }, { status: 400 })
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword) {
            return NextResponse.json({ error: "Mật khẩu mới không được trùng với mật khẩu cũ" }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" })

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 })
    }
}

