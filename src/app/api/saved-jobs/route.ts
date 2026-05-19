import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// GET - Lấy danh sách việc làm đã lưu của user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }

        const savedJobs = await prisma.savedJob.findMany({
            where: { userId },
            include: {
                job: true // Include job details if needed by frontend
            },
            orderBy: {
                savedAt: 'desc'
            }
        })

        const jobIds = savedJobs.map((sj) => sj.jobId)

        return NextResponse.json({
            success: true,
            data: savedJobs.map(sj => ({
                ...sj,
                _id: sj.id,
                jobData: sj.job // Map job object to jobData for compatibility if used
            })),
            jobIds: jobIds,
        })
    } catch (error) {
        console.error("Error fetching saved jobs:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch saved jobs" }, { status: 500 })
    }
}

// POST - Lưu/Bỏ lưu việc làm (Toggle)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, jobId } = body

        if (!userId || !jobId) {
            return NextResponse.json({ success: false, error: "Missing userId or jobId" }, { status: 400 })
        }

        // Check if already saved using the unique constraint
        const existing = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: { userId, jobId }
            }
        })

        if (existing) {
            // Remove if already saved
            await prisma.savedJob.delete({
                where: {
                    userId_jobId: { userId, jobId }
                }
            })
            return NextResponse.json({
                success: true,
                saved: false,
                message: "Job removed from saved list",
            })
        }

        // Save the job
        await prisma.savedJob.create({
            data: {
                userId,
                jobId,
                savedAt: new Date(),
            }
        })

        return NextResponse.json({
            success: true,
            saved: true,
            message: "Job saved successfully",
        })
    } catch (error) {
        console.error("Error saving job:", error)
        return NextResponse.json({ success: false, error: "Failed to save job" }, { status: 500 })
    }
}

// DELETE - Xóa việc làm đã lưu
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")
        const jobId = searchParams.get("jobId")

        if (!userId || !jobId) {
            return NextResponse.json({ success: false, error: "Missing userId or jobId" }, { status: 400 })
        }

        await prisma.savedJob.delete({
            where: {
                userId_jobId: { userId, jobId }
            }
        })

        return NextResponse.json({
            success: true,
            message: "Job removed from saved list",
        })
    } catch (error) {
        console.error("Error deleting saved job:", error)
        return NextResponse.json({ success: false, error: "Failed to remove job" }, { status: 500 })
    }
}

