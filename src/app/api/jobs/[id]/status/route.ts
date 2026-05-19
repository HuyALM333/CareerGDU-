import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status, adminFeedback } = body

        const allowedStatus = ["published", "scheduled", "rejected", "pending"]

        if (!status || !allowedStatus.includes(status)) {
            return NextResponse.json(
                { error: "Trạng thái không hợp lệ" },
                { status: 400 }
            )
        }

        if (status === "rejected" && (!adminFeedback || adminFeedback.trim() === "")) {
            return NextResponse.json(
                { error: "Lý do từ chối là bắt buộc" },
                { status: 400 }
            )
        }

        const job = await prisma.job.findUnique({
            where: { id }
        })

        if (!job) {
            return NextResponse.json(
                { error: "Job không tồn tại" },
                { status: 404 }
            )
        }

        // ✅ chuẩn bị data update trước
        const data: any = { status }

        if (adminFeedback !== undefined) {
            data.adminFeedback = adminFeedback
        }

        const now = new Date()
        const publishAtValue = job.publishAt || job.postedAt || now

        if (status === "published" || status === "scheduled") {
            data.approvedAt = now
            if (!job.publishAt) {
                data.publishAt = publishAtValue
                data.postedAt = publishAtValue
            }
            data.status = publishAtValue > now ? "scheduled" : "published"
        }

        // ✅ update 1 lần duy nhất
        await prisma.job.update({
            where: { id },
            data
        })

        // ✅ tạo notification (không cần cho pending)
        if (data.status !== "pending") {
            let title = ""
            let message = ""

            if (data.status === "published") {
                title = "Tin tuyển dụng đã được duyệt"
                message = `Tin "${job.title}" đã được duyệt và hiển thị.`
            }

            if (data.status === "scheduled") {
                title = "Tin tuyển dụng đã được duyệt"
                message = `Tin "${job.title}" đã được duyệt và sẽ hiển thị từ ${publishAtValue.toLocaleDateString('vi-VN')}.`
            }

            if (data.status === "rejected") {
                title = "Tin tuyển dụng bị từ chối"
                message = `Tin "${job.title}" bị từ chối. Lý do: ${adminFeedback || "Không có"}`
            }

            await prisma.notification.create({
                data: {
                    userId: job.creatorId,
                    type: "job",
                    title,
                    message,
                    link: `/dashboard/my-jobs`,
                    read: false
                }
            })
        }

        return NextResponse.json({
            success: true
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message },
            { status: 500 }
        )
    }
}