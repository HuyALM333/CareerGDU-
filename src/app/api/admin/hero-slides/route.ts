import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { saveBase64Image } from "@/lib/storage"

// Get All (for Admin Management)
export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: [
                { page: 'asc' },
                { order: 'asc' }
            ]
        })
        return NextResponse.json({
            success: true,
            data: slides.map(s => ({ ...s, _id: s.id }))
        })
    } catch (error) {
        console.error("Error fetching admin slides:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch slides" }, { status: 500 })
    }
}

// Create or Update
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id, title, subtitle, image, cta, link, order, isActive, page } = body

        // Handle image saving
        let imageUrl = image
        if (image && image.startsWith("data:image")) {
            imageUrl = await saveBase64Image(image, "slides")
        }

        const slideData: any = {
            title,
            subtitle,
            image: imageUrl,
            cta,
            link,
            page: page || "home",
            order: parseInt(order) || 0,
            isActive: isActive ?? true
        }

        if (id) {
            // Update
            await prisma.heroSlide.update({
                where: { id },
                data: slideData
            })
            return NextResponse.json({ success: true, message: "Cập nhật thành công" })
        } else {
            // Create
            const newSlide = await prisma.heroSlide.create({
                data: slideData
            })
            return NextResponse.json({
                success: true,
                message: "Tạo mới thành công",
                data: { ...newSlide, _id: newSlide.id }
            })
        }
    } catch (error) {
        console.error("Error saving hero slide:", error)
        return NextResponse.json({ success: false, error: "Failed to save slide" }, { status: 500 })
    }
}

// Delete
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        await prisma.heroSlide.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Đã xóa slide" })
    } catch (error) {
        console.error("Error deleting hero slide:", error)
        return NextResponse.json({ success: false, error: "Failed to delete slide" }, { status: 500 })
    }
}

