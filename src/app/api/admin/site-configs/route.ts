import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function GET() {
    try {
        const configs = await prisma.siteConfig.findMany({
            orderBy: { key: 'asc' }
        })
        return NextResponse.json({
            success: true,
            data: configs.map(c => ({ ...c, _id: c.id }))
        })
    } catch (error) {
        console.error("Error fetching admin configs:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch configs" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id, key, title, description, hotTags, isActive } = body

        if (!key) return NextResponse.json({ success: false, error: "Missing key" }, { status: 400 })

        const tags = Array.isArray(hotTags) 
            ? hotTags 
            : (hotTags ? hotTags.split(",").map((t: string) => t.trim()).filter(Boolean) : [])

        const configData: any = {
            key,
            title,
            description,
            hotTags: tags,
            isActive: isActive ?? true
        }

        if (id) {
            await prisma.siteConfig.update({
                where: { id },
                data: configData
            })
        } else {
            // Upsert by key if id is not provided
            await prisma.siteConfig.upsert({
                where: { key },
                update: configData,
                create: configData
            })
        }

        return NextResponse.json({ success: true, message: "Lưu cấu hình thành công" })
    } catch (error) {
        console.error("Error saving site config:", error)
        return NextResponse.json({ success: false, error: "Failed to save config" }, { status: 500 })
    }
}

