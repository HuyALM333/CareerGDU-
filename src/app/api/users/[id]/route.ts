import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { checkNotificationPreference } from "@/lib/notification-utils"

export const dynamic = 'force-dynamic'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // SECURE: Verify authorization
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || (session.userId !== id && session.role !== "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized: Access Denied" }, { status: 403 })
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                createdAt: true,
                updatedAt: true,
                studentId: true,
                major: true,
                faculty: true,
                cohort: true,
                companyName: true,
                website: true,
                address: true,
                description: true,
                size: true,
                contactPerson: true,
                industry: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                _id: user.id
            }
        })
    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch user" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // SECURE: Verify authorization
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || (session.userId !== id && session.role !== "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized: Access Denied" }, { status: 403 })
        }

        const userToDelete = await prisma.user.findUnique({ where: { id } })
        if (!userToDelete) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 3. Prevent deleting Admin accounts by non-root admins
        const adminEmail = process.env.ADMIN_EMAIL
        const body = await req.json().catch(() => ({}))
        const requesterEmail = body.requesterEmail

        if (userToDelete.role === "admin" && requesterEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền xóa tài khoản Quản trị viên." }, { status: 403 })
        }

        console.log(`[API DELETE User] Deleting user ${id} (${userToDelete.email}, ${userToDelete.role}) and all related data`)

        // Cascade cleanup is mostly handled by Prisma (onDelete: Cascade)
        // However, we still need to handle employer specific cleanup (their jobs and related apps)
        await prisma.$transaction(async (tx) => {
            if (userToDelete.role === "employer" || userToDelete.role === "admin") {
                // Deleting user will cascade to Job, and Job will cascade to Application
                // But we define Job -> User with tx.user.delete
                // Let's ensure Job creatorId relation is set to Cascade
            }

            // Finally delete the user record itself
            await tx.user.delete({ where: { id } })
        })

        return NextResponse.json({
            success: true,
            message: "Tài khoản và toàn bộ dữ liệu liên quan đã được xóa sạch."
        })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete user" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        // SECURE: Verify authorization
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || (session.userId !== id && session.role !== "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized: Access Denied" }, { status: 403 })
        }

        const currentUser = await prisma.user.findUnique({ where: { id } })

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Root Admin and Admin management protection
        const adminEmail = process.env.ADMIN_EMAIL
        const requesterEmail = body.requesterEmail

        if (currentUser.role === "admin" && requesterEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền chỉnh sửa tài khoản Quản trị viên." }, { status: 403 })
        }

        // Prevent updating to invalid roles if role is present
        if (body.role && !["student", "employer", "admin"].includes(body.role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        // Role track restriction
        if (body.role && body.role !== currentUser.role) {
            const tracks = {
                student: ["student"],
                employer: ["employer"],
                admin: ["admin"]
            }
            const currentTrack = Object.entries(tracks).find(([_, roles]) => roles.includes(currentUser.role))?.[0]
            const newRoleInSameTrack = currentTrack && (tracks as any)[currentTrack].includes(body.role)

            if (!newRoleInSameTrack) {
                return NextResponse.json({
                    error: `Không thể đổi vai trò từ ${currentUser.role} sang ${body.role}. Đổi vai trò chỉ áp dụng cho tài khoản cùng luồng.`
                }, { status: 400 })
            }
        }

        // Create explicit update object
        const allowedFields = [
            "name", "phone", "studentId", "major", "faculty", "cohort",
            "avatar", "companyName", "website", "address", "description",
            "size", "contactPerson", "industry", "status", "role"
        ]

        const updateData: any = {}
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        })

        // Special check: studentId uniqueness
        if (body.studentId && body.studentId !== currentUser.studentId) {
            if (!/^\d{8}$/.test(body.studentId)) {
                return NextResponse.json({ error: "Mã số sinh viên phải có đủ 8 số" }, { status: 400 })
            }

            const existingStudentId = await prisma.user.findFirst({
                where: {
                    studentId: body.studentId,
                    id: { not: id }
                }
            })

            if (existingStudentId) {
                return NextResponse.json({ error: "Mã số sinh viên này đã được đăng ký bởi tài khoản khác." }, { status: 409 })
            }
        }

        // Special check: email update
        if (body.email && body.email !== currentUser.email) {
            const normalizedEmail = body.email.toLowerCase().trim()
            const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } })
            if (existingEmail) {
                return NextResponse.json({ error: "Email này đã được sử dụng bởi tài khoản khác." }, { status: 409 })
            }
            updateData.email = normalizedEmail
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        })

        // Send Approval Email to Employer
        if (
            currentUser.role === 'employer' &&
            currentUser.status === 'pending' &&
            updateData.status === 'active'
        ) {
            try {
                const shouldSendEmail = await checkNotificationPreference(id, 'email')
                if (shouldSendEmail) {
                    const { sendEmail } = await import("@/services/email.service")
                    await sendEmail({
                        to: currentUser.email,
                        subject: "Tài khoản Nhà tuyển dụng đã được phê duyệt - GDU Career",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                                <div style="background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 40px 20px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 28px;">Chúc mừng!</h1>
                                    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">Tài khoản của bạn đã được phê duyệt</p>
                                </div>
                                <div style="padding: 30px; background-color: #ffffff;">
                                    <h2 style="color: #333; margin-top: 0;">Xin chào ${currentUser.contactPerson || currentUser.name},</h2>
                                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                                        Chúng tôi rất vui mừng thông báo rằng hồ sơ doanh nghiệp của bạn tại <strong>GDU Career Portal</strong> đã được Admin phê duyệt thành công.
                                    </p>
                                    <div style="text-align: center; margin-top: 35px;">
                                        <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/login?approved=true" 
                                           style="background-color: #d32f2f; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                                            Đăng nhập ngay
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `
                    })
                }

                // Create In-App Notification
                await prisma.notification.create({
                    data: {
                        userId: id,
                        type: "system",
                        title: "Tài khoản đã được phê duyệt!",
                        message: `Chào mừng ${currentUser.companyName || currentUser.name}! Tài khoản của bạn đã được kích hoạt.`,
                        link: "/dashboard"
                    }
                })
            } catch (notifyErr) {
                console.error("[Users API] Notification error:", notifyErr)
            }
        }

        // Project safe fields for response
        const { password: _, ...safeUpdatedUser } = updatedUser

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            user: {
                ...safeUpdatedUser,
                _id: safeUpdatedUser.id
            }
        })
    } catch (error) {
        console.error("Update user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update user" },
            { status: 500 }
        )
    }
}

