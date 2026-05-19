import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.job.update({
            where: { id },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Increment view error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

