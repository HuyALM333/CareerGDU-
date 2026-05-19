import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: {
                postedAt: 'desc'
            }
        })

        const simplifiedJobs = jobs.map(job => ({
            _id: job.id,
            title: job.title,
            company: job.company,
            type: job.type,
            status: job.status,
            postedAt: job.postedAt
        }))


        return NextResponse.json({
            count: jobs.length,
            jobs: simplifiedJobs
        })
    } catch (error) {
        console.error("Debug jobs error:", error)
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }
}

