import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const page = searchParams.get("page") || "home"

        let where: any = { isActive: true }
        if (page !== "all") {
            where.page = page
        }

        const slides = await prisma.heroSlide.findMany({
            where,
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json({
            success: true,
            data: slides.map(s => ({ ...s, _id: s.id }))
        })
    } catch (error) {
        console.error("Error fetching hero slides:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch slides" }, { status: 500 })
    }
}
