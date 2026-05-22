import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

const ALLOWED_STATUS = ["UNDER_REVIEW", "VERIFIED", "REJECTED"]

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params
        const body = await request.json().catch(() => ({}))
        const { status, adminNote } = body

        if (!status || !ALLOWED_STATUS.includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
        }

        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || session.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
        }

        if (status === "REJECTED" && (!adminNote || String(adminNote).trim().length === 0)) {
            return NextResponse.json({ success: false, error: "Admin note is required" }, { status: 400 })
        }

        const existing = await prisma.companyVerification.findUnique({
            where: { userId },
        })

        if (!existing) {
            return NextResponse.json({ success: false, error: "Verification not found" }, { status: 404 })
        }

        const reviewedAt = status === "VERIFIED" || status === "REJECTED" ? new Date() : null

        const updated = await prisma.companyVerification.update({
            where: { userId },
            data: {
                status,
                adminNote: adminNote ? String(adminNote).trim() : null,
                reviewedAt,
            },
        })

        if (status === "REJECTED") {
            try {
                await prisma.notification.create({
                    data: {
                        userId,
                        type: "system",
                        title: "Hồ sơ doanh nghiệp bị từ chối",
                        message: `Lý do: ${String(adminNote).trim()}`,
                        link: "/dashboard/company"
                    }
                })
            } catch (notifyError) {
                console.error("[CompanyVerification] Notification error:", notifyError)
            }

            try {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true, name: true, contactPerson: true }
                })

                if (user?.email) {
                    const shouldSendEmail = await (await import("@/lib/notification-utils")).checkNotificationPreference(userId, "email")
                    if (shouldSendEmail) {
                        const { sendEmail } = await import("@/services/email.service")
                        await sendEmail({
                            to: user.email,
                            subject: "Hồ sơ doanh nghiệp bị từ chối - GDU Career",
                            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #d32f2f;">Hồ sơ doanh nghiệp bị từ chối</h2>
                  <p>Xin chào ${user.contactPerson || user.name || "bạn"},</p>
                  <p>Hồ sơ xác minh doanh nghiệp của bạn đã bị từ chối.</p>
                  <p><strong>Lý do:</strong> ${String(adminNote).trim()}</p>
                  <p>Vui lòng cập nhật lại hồ sơ và gửi lại để được xét duyệt.</p>
                </div>
              `
                        })
                    }
                }
            } catch (emailError) {
                console.error("[CompanyVerification] Email error:", emailError)
            }
        }

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error("[CompanyVerification PATCH] error:", error)
        return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 })
    }
}
