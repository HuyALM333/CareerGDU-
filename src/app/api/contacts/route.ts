import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function GET() {
    try {
        // Auth check should be here in a real app, but preserving current logic
        const contacts = await prisma.contact.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            data: contacts
        })
    } catch (error) {
        console.error("Fetch contacts error:", error)
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }
}
