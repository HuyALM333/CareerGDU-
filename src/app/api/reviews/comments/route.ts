import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// GET - Lấy tất cả bình luận của một bài đánh giá
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const reviewId = searchParams.get("reviewId")

        if (!reviewId) {
            return NextResponse.json({ success: false, error: "Missing reviewId" }, { status: 400 })
        }

        const comments = await prisma.reviewComment.findMany({
            where: { reviewId },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            comments: comments.map(c => ({
                id: c.id,
                author: c.user.name,
                userId: c.userId,
                text: c.comment,
                avatarUrl: c.user.avatar || "",
                date: new Date(c.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }),
                createdAt: c.createdAt
            }))
        })
    } catch (error) {
        console.error("Error getting comments:", error)
        return NextResponse.json({ success: false, error: "Failed to get comments" }, { status: 500 })
    }
}

// POST - Thêm bình luận mới
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { reviewId, userId, text } = body

        if (!reviewId || !userId || !text?.trim()) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        const newComment = await prisma.reviewComment.create({
            data: {
                reviewId,
                userId,
                comment: text.trim()
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            comment: {
                id: newComment.id,
                author: newComment.user.name,
                userId: newComment.userId,
                avatarUrl: newComment.user.avatar || "",
                text: newComment.comment,
                date: new Date().toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }),
                createdAt: newComment.createdAt
            },
            message: "Bình luận đã được gửi"
        })
    } catch (error) {
        console.error("Error adding comment:", error)
        return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 })
    }
}

// DELETE - Xóa một bình luận
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const commentId = searchParams.get("id")

        if (!commentId) {
            return NextResponse.json({ success: false, error: "Missing comment id" }, { status: 400 })
        }

        await prisma.reviewComment.delete({
            where: { id: commentId }
        })

        return NextResponse.json({
            success: true,
            message: "Bình luận đã được xóa"
        })
    } catch (error) {
        console.error("Error deleting comment:", error)
        return NextResponse.json({ success: false, error: "Failed to delete comment" }, { status: 500 })
    }
}

