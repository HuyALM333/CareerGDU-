import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { saveBase64Image } from "@/lib/storage"

// GET /api/admin/partners - List all partners
export async function GET() {
    try {
        const partners = await prisma.company.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            partners: partners.map(p => ({
                ...p,
                _id: p.id
            }))
        })
    } catch (error) {
        console.error("Error fetching partners:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch partners" }, { status: 500 })
    }
}

// POST /api/admin/partners - Create a new partner
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, logo, industry, size, address, description, website, verified, benefits, rating } = body


        if (!name || !industry) {
            return NextResponse.json({ success: false, error: "Name and Industry are required" }, { status: 400 })
        }

        // Handle logo
        let logoUrl = logo
        if (logo && logo.startsWith("data:image")) {
            logoUrl = await saveBase64Image(logo, "logos")
        }

        const newPartner = await prisma.company.create({
            data: {
                name,
                logo: logoUrl || "/placeholder.svg",
                industry,
                size: size || "N/A",
                address: address || "N/A",
                description: description || "",
                website: website || "",
                verified: verified ?? true,
                benefits: benefits || [],
                openPositions: 0,
                rating: 5.0
            }
        })


        return NextResponse.json({
            success: true,
            partner: { ...newPartner, _id: newPartner.id }
        })
    } catch (error) {
        console.error("Error creating partner:", error)
        return NextResponse.json({ success: false, error: "Failed to create partner" }, { status: 500 })
    }
}

