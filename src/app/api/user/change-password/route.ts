import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, currentPassword, newPassword, otp } = body

        if (!userId || !currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Vui lòng điền đầy đủ thông tin" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
                { status: 400 }
            )
        }

        // Get user from database using Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Mật khẩu hiện tại không đúng" },
                { status: 401 }
            )
        }

        // For admin users, require OTP verification
        if (user.role === "admin") {
            if (!otp) {
                return NextResponse.json(
                    { error: "Vui lòng nhập mã OTP để xác thực", requiresOtp: true },
                    { status: 400 }
                )
            }

            // Verify OTP
            const isOtpValid = user.passwordChangeOtp === otp && 
                               user.passwordChangeOtpExpires && 
                               new Date() < new Date(user.passwordChangeOtpExpires)

            if (!isOtpValid) {
                return NextResponse.json(
                    { error: "Mã OTP không chính xác hoặc đã hết hạn" },
                    { status: 400 }
                )
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password and clear OTP tokens using Prisma
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                passwordChangeOtp: null,
                passwordChangeOtpExpires: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        })

    } catch (error) {
        console.error("[API] Change password error:", error)
        return NextResponse.json(
            { error: "Đổi mật khẩu thất bại. Vui lòng thử lại." },
            { status: 500 }
        )
    }
}

