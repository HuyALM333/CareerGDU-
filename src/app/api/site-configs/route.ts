import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const key = searchParams.get("key")

        if (key) {
            const config = await prisma.siteConfig.findUnique({
                where: { key, isActive: true }
            })
            return NextResponse.json({
                success: true,
                data: config ? { ...config, _id: config.id } : null
            })
        }

        const configs = await prisma.siteConfig.findMany({
            where: { isActive: true }
        })

        return NextResponse.json({
            success: true,
            data: configs.map(c => ({ ...c, _id: c.id }))
        })
    } catch (error) {
        console.error("Error fetching site configs:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch configurations" }, { status: 500 })
    }
}
