import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const company = await prisma.company.findUnique({
            where: { id }
        })

        if (!company) {
            return NextResponse.json(
                { success: false, error: "Company not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            company: {
                ...company,
                _id: company.id,
                id: company.id
            },
        })
    } catch (error) {
        console.error("Error fetching company:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch company" },
            { status: 500 }
        )
    }
}

