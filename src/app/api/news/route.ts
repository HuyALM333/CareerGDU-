import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export const dynamic = 'force-dynamic'

// 🔥 mapper chuẩn
function mapNews(item: any) {
    return {
        ...item,
        _id: item.id,

        // ✅ FIX FE mismatch
        imageUrl: item.image,

        // ✅ tạo summary nếu thiếu
        summary: item.summary || item.content?.slice(0, 150) || "",

        // ✅ đồng bộ naming
        sourceName: item.author || item.sourceName || "GDU",
        sourceUrl: item.sourceUrl || ""
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get("limit") || "20")
        const category = searchParams.get("category")
        const id = searchParams.get("id")

        if (id) {
            const item = await prisma.news.findUnique({
                where: { id }
            })
            if (!item) {
                return NextResponse.json(
                    { success: false, error: "News not found" },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                data: mapNews(item) // 🔥 FIX
            })
        }

        let where: any = {}
        if (category && category !== "all" && category !== "Tất cả") {
            where.category = { contains: category }
        }

        const news = await prisma.news.findMany({
            where,
            orderBy: {
                publishedAt: 'desc'
            },
            take: limit
        })

        return NextResponse.json({
            success: true,
            data: news.map(mapNews) // 🔥 FIX
        })
    } catch (error) {
        console.error("Error fetching news:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch news" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, content, category, image, author } = body

        if (!title || !content || !category) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        const slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')

        const newsItem = await prisma.news.create({
            data: {
                title,
                content,
                category,
                image,
                author,
                slug,
                views: 0,
                publishedAt: new Date(),
                status: 'published'
            }
        })

        return NextResponse.json({
            success: true,
            data: mapNews(newsItem) // 🔥 FIX
        })
    } catch (error) {
        console.error("Error creating news:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create news" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing ID" },
                { status: 400 }
            )
        }

        await prisma.news.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: "News deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting news:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete news" },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { _id, id, ...updateData } = body
        const targetId = id || _id

        if (!targetId) {
            return NextResponse.json(
                { success: false, error: "Missing ID" },
                { status: 400 }
            )
        }

        const cleanData: any = {}
        const allowedFields = [
            'title',
            'content',
            'category',
            'image',
            'author',
            'views',
            'slug',
            'status'
        ]

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field]
            }
        })

        if (cleanData.title) {
            cleanData.slug = cleanData.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-')
        }

        const updated = await prisma.news.update({
            where: { id: targetId },
            data: cleanData
        })

        return NextResponse.json({
            success: true,
            data: mapNews(updated) // 🔥 FIX luôn trả về
        })
    } catch (error) {
        console.error("Error updating news:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update news" },
            { status: 500 }
        )
    }
}