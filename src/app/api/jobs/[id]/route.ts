import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { revalidatePath } from "next/cache"

// DELETE /api/jobs/[id]
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // In real app: Check if user owns this job before deleting!
        const result = await prisma.job.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Job deleted successfully" })
    } catch (error: any) {
        console.error("Delete job error:", error)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }
        return NextResponse.json(
            { success: false, error: "Failed to delete job" },
            { status: 500 }
        )
    }
}

// PATCH /api/jobs/[id] - Update Job Details
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()

        // Filter fields to safeguard
        const { _id, creatorId, id: bodyId, ...updateFields } = body

        // Lấy thông tin job cũ để biết creatorId và status cũ
        const currentJob = await prisma.job.findUnique({
            where: { id }
        })

        if (!currentJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        const updateData: any = {}

        if (updateFields.title !== undefined) updateData.title = updateFields.title
        if (updateFields.company !== undefined) updateData.company = updateFields.company
        if (updateFields.description !== undefined) updateData.description = updateFields.description

        if (updateFields.requirements !== undefined) {
            updateData.requirements = Array.isArray(updateFields.requirements)
                ? updateFields.requirements
                : []
        }

        if (updateFields.benefits !== undefined) {
            updateData.benefits = Array.isArray(updateFields.benefits)
                ? updateFields.benefits
                : []
        }

        if (updateFields.salaryMin !== undefined) {
            const num = Number(updateFields.salaryMin)
            updateData.salaryMin = isNaN(num) ? null : num
        }

        if (updateFields.salaryMax !== undefined) {
            const num = Number(updateFields.salaryMax)
            updateData.salaryMax = isNaN(num) ? null : num
        }

        if (updateFields.deadline !== undefined) {
            updateData.deadline = updateFields.deadline
            if (typeof updateFields.deadline === "string" && updateFields.deadline.trim() !== "") {
                const parsedDeadline = updateFields.deadline.includes("/")
                    ? new Date(updateFields.deadline.split("/").reverse().join("-"))
                    : new Date(updateFields.deadline)
                updateData.expiredAt = !isNaN(parsedDeadline.getTime()) ? parsedDeadline : null
            } else {
                updateData.expiredAt = null
            }
        }

        if (updateFields.status !== undefined) {
            updateData.status = updateFields.status
        }

        if (updateFields.adminFeedback !== undefined) {
            updateData.adminFeedback = updateFields.adminFeedback
        }

        if (updateFields.documentUrl !== undefined) {
            if (
                typeof updateFields.documentUrl === "string" &&
                updateFields.documentUrl.startsWith("data:")
            ) {
                updateData.documentUrl = null
            } else if (typeof updateFields.documentUrl === "string") {
                updateData.documentUrl = updateFields.documentUrl
            }
        }

        if (updateFields.postedAt !== undefined) {
            const parsedPublishAt = new Date(updateFields.postedAt)
            if (!isNaN(parsedPublishAt.getTime())) {
                updateData.publishAt = parsedPublishAt
                updateData.postedAt = parsedPublishAt
            }
        }

        // Do not override publish date when status changes

        await prisma.job.update({
            where: { id },
            data: updateData
        })

        // Notification Logic: Thông báo cho Employer khi status thay đổi
        if (updateData.status && updateData.status !== currentJob.status) {
            try {
                let message = ""
                let title = ""

                if (updateData.status === 'published') {
                    title = "Tin tuyển dụng được duyệt"
                    message = `Tin tuyển dụng "${currentJob.title}" của bạn đã được phê duyệt và hiển thị công khai.`
                } else if (updateData.status === 'scheduled') {
                    title = "Tin tuyển dụng được duyệt"
                    message = `Tin tuyển dụng "${currentJob.title}" đã được duyệt và sẽ hiển thị theo lịch.`
                } else if (updateData.status === 'rejected') {
                    title = "Tin tuyển dụng cần chỉnh sửa"
                    const reason = updateData.rejectionReason || body.rejectionReason
                    if (reason) {
                        message = `Tin tuyển dụng "${currentJob.title}" cần chỉnh sửa thêm. Lý do: ${reason}`
                    } else {
                        message = `Tin tuyển dụng "${currentJob.title}" của bạn cần được chỉnh sửa trước khi đăng. Vui lòng kiểm tra và cập nhật lại.`
                    }
                }

                if (title && currentJob.creatorId) {
                    await prisma.notification.create({
                        data: {
                            userId: currentJob.creatorId,
                            type: 'system',
                            title: title,
                            message: message,
                            link: `/dashboard/my-jobs`
                        }
                    })
                }
            } catch (err) {
                console.error("Failed to create status notification:", err)
            }
        }

        // Revalidate paths to refresh cache
        revalidatePath("/jobs/" + id)
        revalidatePath("/")
        revalidatePath("/dashboard/my-jobs")

        return NextResponse.json({ success: true, message: "Job updated successfully" })
    } catch (error) {
        console.error("Update job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update job" },
            { status: 500 }
        )
    }
}

// GET /api/jobs/[id] - Get Single Job Details for Edit
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params

        const job = await prisma.job.findUnique({
            where: { id }
        })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: { ...job, _id: job.id }
        })
    } catch (error) {
        console.error("Get job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch job" },
            { status: 500 }
        )
    }
}

