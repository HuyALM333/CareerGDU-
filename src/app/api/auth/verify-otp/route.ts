import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import crypto from "crypto"

// Hash OTP for secure storage
function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, otp } = body
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail || !otp) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        // 1. Search in main USERS (Legacy unverified users or already verified)
        let user: any = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })
        let isFromPending = false

        if (!user) {
            // 2. Search in PendingUser table
            user = await prisma.pendingUser.findUnique({
                where: { email: normalizedEmail }
            })
            isFromPending = true
        }

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: "Email đã được xác minh trước đó",
                data: { user: { ...user, id: user.id } }
            })
        }

        // Validate OTP
        const hashedInputOtp = hashOTP(otp)

        if (user.emailOtp !== hashedInputOtp) {
            return NextResponse.json({ error: "Mã OTP không chính xác" }, { status: 400 })
        }

        if (new Date() > new Date(user.emailOtpExpires)) {
            return NextResponse.json({ error: "Mã OTP đã hết hạn" }, { status: 400 })
        }

        let finalizedUser: any = null

        if (isFromPending) {
            // Move from PendingUser to User
            const { id: _, ...userData } = user
            finalizedUser = await prisma.$transaction(async (tx) => {
                const u = await tx.user.upsert({
                    where: { email: normalizedEmail },
                    update: {
                        ...userData,
                        emailVerified: true,
                        emailOtp: null,
                        emailOtpExpires: null,
                        updatedAt: new Date()
                    },
                    create: {
                        ...userData,
                        emailVerified: true,
                        emailOtp: null,
                        emailOtpExpires: null
                    }
                })
                await tx.pendingUser.delete({
                    where: { email: normalizedEmail }
                })
                return u
            })
        } else {
            // Legacy unverified user already in User table
            finalizedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailOtp: null,
                    emailOtpExpires: null,
                    updatedAt: new Date()
                }
            })
        }

        // Notify Admin
        if (process.env.ADMIN_EMAIL) {
            try {
                const { sendEmail } = await import("@/services/email.service")
                const isEmployer = finalizedUser.role === "employer"
                const subject = isEmployer
                    ? `🏢 Nhà tuyển dụng mới đăng ký: ${finalizedUser.companyName || finalizedUser.name}`
                    : `✨ Người dùng mới đã xác minh: ${finalizedUser.name}`

                const htmlContent = isEmployer
                    ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #D32F2F;">Nhà tuyển dụng mới cần phê duyệt</h2>
                        <p>Một nhà tuyển dụng mới vừa xác minh email và đang chờ phê duyệt.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <h3 style="color: #333;">Thông tin doanh nghiệp:</h3>
                        <ul>
                            <li><strong>Tên công ty:</strong> ${finalizedUser.companyName || "Chưa cập nhật"}</li>
                            <li><strong>Người liên hệ:</strong> ${finalizedUser.contactPerson || finalizedUser.name}</li>
                            <li><strong>Email:</strong> ${finalizedUser.email}</li>
                            <li><strong>SĐT:</strong> ${finalizedUser.phone || "Chưa cập nhật"}</li>
                            <li><strong>Quy mô:</strong> ${finalizedUser.companySize || "N/A"}</li>
                            <li><strong>Ngành nghề:</strong> ${finalizedUser.industry || "N/A"}</li>
                        </ul>
                        </div>`
                    : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0F52BA;">Người dùng mới đã xác minh tài khoản</h2>
                        <p>Thông tin chi tiết:</p>
                        <ul>
                            <li><strong>Họ tên:</strong> ${finalizedUser.name}</li>
                            <li><strong>Email:</strong> ${finalizedUser.email}</li>
                            <li><strong>Vai trò:</strong> ${finalizedUser.role || "student"}</li>
                        </ul>
                        </div>`

                await sendEmail({
                    to: process.env.ADMIN_EMAIL!,
                    subject: subject,
                    html: htmlContent
                })

                if (isEmployer) {
                    await prisma.notification.create({
                        data: {
                            targetRole: "admin",
                            type: "system",
                            title: "Nhà tuyển dụng mới chờ duyệt",
                            message: `${finalizedUser.companyName || finalizedUser.name} vừa đăng ký tài khoản nhà tuyển dụng.`,
                            read: false,
                            link: "/dashboard/users?role=employer"
                        }
                    })
                }
            } catch (err) {
                console.error("Admin notification failed:", err)
            }
        }

        const { password: _, ...userNoPassword } = finalizedUser
        return NextResponse.json({
            success: true,
            message: "Xác minh thành công",
            data: {
                user: { ...userNoPassword, _id: finalizedUser.id },
                needsPhoneVerification: false
            }
        })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 })
    }
}

