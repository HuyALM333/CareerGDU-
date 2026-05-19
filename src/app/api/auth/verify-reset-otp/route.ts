import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })
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

        return NextResponse.json({ success: true, message: "OTP hợp lệ" })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 })
    }
}

