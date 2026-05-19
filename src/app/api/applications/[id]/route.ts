import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { sendEmail } from "@/services/email.service"
import { getInterviewEmailTemplate, getRejectedEmailTemplate, getHiredEmailTemplate } from "@/lib/email-templates"
import { checkNotificationPreference } from "@/lib/notification-utils"

// GET - Get application details by ID (including CV)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")?.value
        const session = await decrypt(sessionCookie)

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.userId as string
        const userRole = session.role as string

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true
            }
        })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization check
        const isAdmin = userRole === 'admin'
        const isEmployer = userRole === 'employer' && application.job.creatorId === userId
        const isStudent = userRole === 'student' && application.userId === userId

        if (!isAdmin && !isEmployer && !isStudent) {
            return NextResponse.json({ error: "Forbidden: You don't have access to this application" }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: application.id,
                jobId: application.jobId,
                applicantId: application.userId,
                employerId: application.job.creatorId,

                jobTitle: application.job.title,

                // ✅ FIX CV
                cvBase64: application.cvBase64,
                cvUrl: application.cvUrl,
                cvType: application.cvType,
                cvOriginalName: application.cvOriginalName,

                status: application.status,
                appliedAt: application.appliedAt
            }
        })
    } catch (error) {
        console.error("Error fetching application:", error)
        return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
    }
}

// PATCH - Update application status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")?.value
        const session = await decrypt(sessionCookie)

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.userId as string
        const userRole = session.role as string

        const body = await request.json()
        const { status, notes } = body

        const validStatuses = ["new", "reviewed", "interviewed", "rejected", "hired"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // Fetch application before update to check permissions and get metadata
        const currentApplication = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true
            }
        })

        if (!currentApplication) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization check
        const isAdmin = userRole === 'admin'
        const isOwner = userRole === 'employer' && currentApplication.job.creatorId === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Bạn không có quyền cập nhật trạng thái này" }, { status: 403 })
        }

        // Logic check: Enforce hiring limit
        if (status === "hired" && currentApplication.status !== "hired") {
            try {
                const job = currentApplication.job
                if (job.quantity && job.quantity > 0) {
                    const hiredCount = await prisma.application.count({
                        where: {
                            jobId: job.id,
                            status: "hired"
                        }
                    })

                    if (hiredCount >= job.quantity) {
                        return NextResponse.json({
                            error: `Đã tuyển đủ số lượng (${job.quantity} người). Không thể tuyển thêm.`
                        }, { status: 400 })
                    }
                }
            } catch (err) {
                console.error("Error checking hiring limit:", err)
            }
        }

        const updateData: any = {}
        if (status) updateData.status = status
        if (notes !== undefined) updateData.notes = notes

        await prisma.application.update({
            where: { id },
            data: updateData
        })

        // Create notification for student if status changed
        if (status && status !== currentApplication.status) {
            try {
                const jobTitle = currentApplication.job.title || "công việc"
                let notificationTitle = ""
                let notificationMessage = ""
                let notificationType = "job"

                switch (status) {
                    case "reviewed":
                        notificationTitle = "Hồ sơ đã được xem"
                        notificationMessage = `Nhà tuyển dụng đã xem hồ sơ của bạn cho vị trí ${jobTitle}.`
                        break
                    case "interviewed":
                        notificationTitle = "Mời phỏng vấn"
                        notificationMessage = `Bạn có lời mời phỏng vấn cho vị trí ${jobTitle}. Vui lòng kiểm tra email hoặc điện thoại để biết chi tiết.`
                        notificationType = "interview"
                        break
                    case "hired":
                        notificationTitle = "Chúc mừng!"
                        notificationMessage = `Chúc mừng! Bạn đã được nhận vào vị trí ${jobTitle}.`
                        break
                    case "rejected":
                        notificationTitle = "Kết quả ứng tuyển"
                        notificationMessage = `Cảm ơn bạn đã quan tâm. Rất tiếc hồ sơ vị trí ${jobTitle} chưa phù hợp lần này. Hẹn bạn ở cơ hội khác nhé!`
                        break
                }

                if (notificationTitle) {
                    await prisma.notification.create({
                        data: {
                            userId: currentApplication.userId,
                            type: notificationType,
                            title: notificationTitle,
                            message: notificationMessage,
                            link: `/dashboard/applications`,
                            contactId: null // Clear any contact association
                        }
                    })
                }

                // --- Send Email Notification to Candidate ---
                if (["interviewed", "rejected", "hired"].includes(status)) {
                    const candidateEmail = currentApplication.email
                    const candidateName = currentApplication.name
                    const jobTitle = currentApplication.job.title

                    let emailSubject = ""
                    let emailHtml = ""

                    if (status === "interviewed") {
                        emailSubject = `[GDU Career] Mời phỏng vấn vị trí: ${jobTitle}`
                        emailHtml = getInterviewEmailTemplate(candidateName, jobTitle)
                    } else if (status === "rejected") {
                        emailSubject = `[GDU Career] Kết quả ứng tuyển vị trí: ${jobTitle}`
                        emailHtml = getRejectedEmailTemplate(candidateName, jobTitle)
                    } else if (status === "hired") {
                        emailSubject = `[GDU Career] Chúc mừng bạn đã trúng tuyển vị trí: ${jobTitle}`
                        emailHtml = getHiredEmailTemplate(candidateName, jobTitle)
                    }

                    if (emailSubject && candidateEmail) {
                        const shouldSendEmail = await checkNotificationPreference(currentApplication.userId, 'email')
                        if (shouldSendEmail) {
                            sendEmail({
                                to: candidateEmail,
                                subject: emailSubject,
                                html: emailHtml
                            }).catch(err => console.error("Async email sending failed:", err))
                        }
                    }
                }
            } catch (notifError) {
                console.error("Failed to create student status notification:", notifError)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Application updated successfully"
        })
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }
}

// DELETE - Delete application
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")?.value
        const session = await decrypt(sessionCookie)

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.userId as string
        const userRole = session.role as string

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true
            }
        })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Authorization check
        const isAdmin = userRole === 'admin'
        const isOwner = userRole === 'employer' && application.job.creatorId === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden: You don't have permission to delete this application" }, { status: 403 })
        }

        await prisma.application.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: "Application deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting application:", error)
        return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
    }
}

