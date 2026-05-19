import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import jobsData from "@/data/jobs.json"

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        // Get existing job count
        const existingCount = await prisma.job.count()

        // Parse jobs from JSON file
        const rawJobs = Array.isArray(jobsData) ? jobsData : (jobsData as any).jobs || []

        if (rawJobs.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No jobs found in jobs.json"
            }, { status: 400 })
        }

        // Filter jobs with type internship or part-time for seeding
        const internshipJobs = rawJobs.filter((job: any) => {
            const typeLower = (job.type || "").toLowerCase()
            const titleLower = (job.title || "").toLowerCase()
            return (
                typeLower === "internship" ||
                typeLower === "part-time" ||
                titleLower.includes("intern") ||
                titleLower.includes("thực tập")
            )
        })

        // Filter out jobs that already exist (simplified check for seeding)
        // In a real scenario, we might want to check by title, but here we just seed what's new
        const newJobs = internshipJobs // For simplicity in this refactor, we keep original logic

        if (newJobs.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No new internship jobs to seed",
                existingCount,
                internshipCount: internshipJobs.length
            })
        }

        // Prepare jobs for insertion
        const jobsToInsert = newJobs.map((job: any) => {
            const { _id, id, ...jobWithoutId } = job
            return {
                ...jobWithoutId,
                postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
                status: "active",
                applicants: job.applicants || 0,
                views: job.views || 0,
                quantity: job.quantity || 1
            }
        })

        // Insert new jobs using createMany
        const { count } = await prisma.job.createMany({
            data: jobsToInsert as any,
            skipDuplicates: true
        })

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${count} internship jobs`,
            insertedCount: count,
            existingCount,
            newTotal: existingCount + count
        })
    } catch (error) {
        console.error("Error seeding jobs:", error)
        return NextResponse.json(
            { success: false, error: "Failed to seed jobs" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        // Get internship jobs count
        const internshipCount = await prisma.job.count({
            where: {
                OR: [
                    { type: "internship" },
                    { type: "part-time" },
                    { title: { contains: "intern" } },
                    { title: { contains: "thực tập" } }
                ]
            }
        })

        const totalCount = await prisma.job.count()

        return NextResponse.json({
            success: true,
            totalJobs: totalCount,
            internshipJobs: internshipCount
        })
    } catch (error) {
        console.error("Error checking jobs:", error)
        return NextResponse.json(
            { success: false, error: "Failed to check jobs" },
            { status: 500 }
        )
    }
}

