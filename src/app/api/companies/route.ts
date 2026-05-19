import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const industry = searchParams.get("industry") || ""
        const size = searchParams.get("size") || ""

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { industry: { contains: search } },
                { description: { contains: search } }
            ]
        }

        if (industry) {
            where.industry = industry
        }

        if (size) {
            where.size = size
        }

        const companies = await prisma.company.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            companies: companies.map(c => ({
                ...c,
                _id: c.id
            })),
            total: companies.length
        })
    } catch (error) {
        console.error("Error fetching companies:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
    }
}

