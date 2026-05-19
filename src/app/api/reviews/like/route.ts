import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// POST - Thích/Bỏ thích một bài đánh giá (Toggle)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { reviewId, visitorId: userId } = body

        if (!reviewId || !userId) {
            return NextResponse.json({ success: false, error: "Missing reviewId or userId" }, { status: 400 })
        }

        // Check if user already liked this review using unique constraint
        const existingLike = await prisma.reviewLike.findUnique({
            where: {
                reviewId_userId: { reviewId, userId }
            }
        })

        if (existingLike) {
            // Unlike - remove the like
            await prisma.reviewLike.delete({
                where: {
                    reviewId_userId: { reviewId, userId }
                }
            })
            const totalLikes = await prisma.reviewLike.count({ where: { reviewId } })
            return NextResponse.json({
                success: true,
                liked: false,
                totalLikes,
                message: "Đã bỏ thích"
            })
        } else {
            // Like - add new like
            await prisma.reviewLike.create({
                data: {
                    reviewId,
                    userId
                }
            })
            const totalLikes = await prisma.reviewLike.count({ where: { reviewId } })
            return NextResponse.json({
                success: true,
                liked: true,
                totalLikes,
                message: "Đã thích"
            })
        }
    } catch (error) {
        console.error("Error toggling like:", error)
        return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 })
    }
}

// GET - Lấy tổng số lượt thích và kiểm tra trạng thái thích của user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const reviewId = searchParams.get("reviewId")
        const userId = searchParams.get("visitorId")

        if (!reviewId) {
            return NextResponse.json({ success: false, error: "Missing reviewId" }, { status: 400 })
        }

        const totalLikes = await prisma.reviewLike.count({ where: { reviewId } })

        let liked = false
        if (userId) {
            const existingLike = await prisma.reviewLike.findUnique({
                where: {
                    reviewId_userId: { reviewId, userId }
                }
            })
            liked = !!existingLike
        }


        return NextResponse.json({
            success: true,
            totalLikes,
            liked
        })
    } catch (error) {
        console.error("Error getting likes:", error)
        return NextResponse.json({ success: false, error: "Failed to get likes" }, { status: 500 })
    }
}

