import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// Admin-only endpoint to sync applicant counts for all jobs
export async function POST() {
    try {
        // Get all jobs
        const jobs = await prisma.job.findMany()

        let updatedCount = 0
        const results: { jobId: string; title: string; oldCount: number; newCount: number }[] = []

        for (const job of jobs) {
            // Count applications for this job
            const count = await prisma.application.count({
                where: {
                    jobId: job.id
                }
            })

            const oldCount = job.applicants || 0

            // Update the job's applicants count if it has changed
            if (oldCount !== count) {
                await prisma.job.update({
                    where: { id: job.id },
                    data: { applicants: count }
                })
                
                updatedCount++
                results.push({
                    jobId: job.id,
                    title: job.title || "Unknown",
                    oldCount,
                    newCount: count
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Đã cập nhật ${updatedCount} tin tuyển dụng`,
            totalJobs: jobs.length,
            updatedJobs: updatedCount,
            details: results
        })

    } catch (error) {
        console.error("Error syncing applicant counts:", error)
        return NextResponse.json(
            { success: false, error: "Có lỗi xảy ra khi đồng bộ" },
            { status: 500 }
        )
    }
}

