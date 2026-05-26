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

        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const currentJob = await prisma.job.findUnique({
            where: { id }
        })

        if (!currentJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        if (session.role !== "admin" && currentJob.creatorId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            )
        }

        await prisma.job.update({
            where: { id },
            data: {
                status: "closed"
            }
        })

        return NextResponse.json({ success: true, message: "Job archived successfully" })
    } catch (error: any) {
        console.error("Archive job error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to archive job" },
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

        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (session.role === "admin") {
            return NextResponse.json(
                { success: false, error: "Admin cannot edit job content" },
                { status: 403 }
            )
        }

        // Filter fields to safeguard
        const { _id, creatorId, id: bodyId, ...updateFields } = body

        // Lấy thông tin job cũ để biết creatorId và status cũ
        const currentJob = await prisma.job.findUnique({
            where: { id }
        })

        if (!currentJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        if (currentJob.creatorId !== session.userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            )
        }

        // Logic để ngăn chặn gia hạn hoặc chỉnh sửa nếu job đã hết hạn
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh

        const currentExpiredAt = currentJob.expiredAt ? new Date(currentJob.expiredAt) : (currentJob.deadline && currentJob.deadline !== "Vô thời hạn" ? new Date(currentJob.deadline.split("/").reverse().join("-")) : null);
        if (currentExpiredAt) {
            currentExpiredAt.setHours(0, 0, 0, 0);
        }

        const isCurrentlyExpired = currentJob.status === 'expired' || (currentExpiredAt && currentExpiredAt < today);
        let forceSetPublished = false
        if (isCurrentlyExpired && updateFields.deadline) {
            const newDeadlineCandidate = typeof updateFields.deadline === "string"
                ? (updateFields.deadline.includes("/")
                    ? new Date(updateFields.deadline.split("/").reverse().join("-"))
                    : new Date(updateFields.deadline))
                : updateFields.deadline;

            if (newDeadlineCandidate instanceof Date && !isNaN(newDeadlineCandidate.getTime())) {
                newDeadlineCandidate.setHours(0, 0, 0, 0);
                if (newDeadlineCandidate < today) {
                    return NextResponse.json(
                        { success: false, error: "Không thể gia hạn hoặc đặt hạn chót trong quá khứ cho tin tuyển dụng đã hết hạn." },
                        { status: 400 }
                    );
                }
                // Nếu deadline mới hợp lệ và ở tương lai, đánh dấu để chuyển status về published sau
                forceSetPublished = true
            } else {
                return NextResponse.json(
                    { success: false, error: "Hạn chót mới không hợp lệ." },
                    { status: 400 }
                );
            }
        } else if (isCurrentlyExpired && !updateFields.deadline) {
            // Nếu job đã hết hạn và không có deadline mới, không cho phép update (trừ các trường khác không liên quan đến thời gian)
            // Có thể cho phép update các trường khác nhưng không phải deadline hoặc status
            // Hiện tại chỉ chặn nếu có ý định thay đổi deadline/status
            if (updateFields.status && updateFields.status !== currentJob.status && updateFields.status !== 'expired' && updateFields.status !== 'closed') {
                return NextResponse.json(
                    { success: false, error: "Không thể thay đổi trạng thái của tin tuyển dụng đã hết hạn mà không gia hạn." },
                    { status: 400 }
                );
            }
        }

        const updateData: any = {};

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
            // Chuẩn hóa định dạng deadline từ frontend
            let parsedDeadlineDate: Date | null = null;
            if (typeof updateFields.deadline === "string" && updateFields.deadline.trim() !== "") {
                // Kiểm tra nếu là định dạng "dd/MM/yyyy" hoặc "yyyy-MM-dd"
                if (updateFields.deadline.includes("/")) {
                    const [day, month, year] = updateFields.deadline.split("/").map(Number);
                    parsedDeadlineDate = new Date(year, month - 1, day);
                } else {
                    parsedDeadlineDate = new Date(updateFields.deadline);
                }
            } else if (updateFields.deadline instanceof Date) {
                parsedDeadlineDate = updateFields.deadline;
            }

            if (parsedDeadlineDate && !isNaN(parsedDeadlineDate.getTime())) {
                updateData.deadline = parsedDeadlineDate.toISOString().split('T')[0]; // Lưu dưới dạng YYYY-MM-DD string
                updateData.expiredAt = parsedDeadlineDate; // Lưu dưới dạng DateTime
                // Nếu deadline mới ở tương lai, tự động chuyển status về published
                if (parsedDeadlineDate.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0) && currentJob.status !== 'published') {
                    forceSetPublished = true
                }
            } else {
                updateData.deadline = null;
                updateData.expiredAt = null;
            }
        }

        if (updateFields.status !== undefined) {
            updateData.status = updateFields.status;
        }

        // Apply force publish flag if set (from deadline logic)
        if (typeof forceSetPublished !== 'undefined' && forceSetPublished && !updateData.status) {
            updateData.status = 'published'
        }

        // If no fields to update, return a clear error to avoid false success
        if (!updateData || Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
        }

        // Nếu status được set là 'published' nhưng deadline đã hết hạn, điều chỉnh lại status
        if (updateData.status === 'published' && updateData.expiredAt) {
            if (updateData.expiredAt.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
                updateData.status = 'expired';
            }
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

        const updatedJob = await prisma.job.update({
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
        revalidatePath("/jobs")
        revalidatePath("/")
        revalidatePath("/dashboard/my-jobs")

        return NextResponse.json({ success: true, message: "Job updated successfully", data: { ...updatedJob, _id: updatedJob.id } })
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

