import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import reviewsData from "@/data/reviews.json"

function getAvatarColor(name: string): string {
    const colors = [
        "from-blue-500 to-blue-600",
        "from-purple-500 to-purple-600",
        "from-pink-500 to-pink-600",
        "from-green-500 to-green-600",
        "from-yellow-500 to-yellow-600",
        "from-red-500 to-red-600",
        "from-indigo-500 to-indigo-600",
        "from-teal-500 to-teal-600",
        "from-orange-500 to-orange-600",
        "from-cyan-500 to-cyan-600",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

interface ProcessedReview {
    id: number
    name: string
    avatar: string
    avatarUrl: string
    rating: number
    comment: string
    raw_rating: string
    review_time: string
    verified: boolean
}

function getReviewsData() {
    const reviews = reviewsData as ProcessedReview[]

    if (!reviews || reviews.length === 0) {
        return []
    }

    return reviews.map((review) => {
        return {
            id: String(review.id),
            _id: String(review.id),
            author: review.name,
            avatar: review.avatar,
            avatarUrl: review.avatarUrl || "",
            avatarColor: getAvatarColor(review.name),
            major: "Sinh viên GDU",
            year: "K2023",
            rating: review.rating,
            category: "Đánh giá Google Maps",
            title: generateTitle(review.comment, review.rating),
            content: review.comment,
            likes: 0,
            comments: 0,
            date: "",
            review_time: review.review_time || "",
            helpful: review.verified,
        }
    })
}

function generateTitle(comment: string, rating: number): string {
    if (!comment || comment.trim().length === 0) {
        return rating >= 4 ? "Trải nghiệm tốt" : rating === 3 ? "Trải nghiệm khá" : "Cần cải thiện"
    }

    if (comment.length <= 50) return comment

    const firstSentence = comment.split(/[.!?]/)[0].trim()
    if (firstSentence.length > 0 && firstSentence.length <= 60) {
        return firstSentence
    }

    return comment.substring(0, 50) + "..."
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")
        const userId = searchParams.get("userId")

        // 1. Load JSON Reviews
        const jsonReviews = getReviewsData()

        // 2. Load User Reviews from Prisma
        const userReviewsDb = await prisma.userReview.findMany({
            where: {
                status: 'active' // Or whatever your default status is. 
                // Note: Existing code didn't filter by status during listing
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                        role: true,
                        major: true
                    }
                },
                _count: {
                    select: {
                        reviewLikes: true,
                        reviewComments: true
                    }
                }
            }
        })

        const mappedUserReviews = userReviewsDb.map(doc => ({
            id: doc.id,
            _id: doc.id,
            author: doc.user.name,
            avatar: doc.user.avatar || (doc.user.name ? doc.user.name.charAt(0).toUpperCase() : "U"),
            avatarUrl: doc.user.avatar || "",
            avatarColor: "from-primary to-secondary",
            major: doc.user.major || "Sinh viên GDU",
            year: doc.createdAt.getFullYear().toString(),
            rating: doc.rating,
            category: "Góp ý - Phản hồi", // Categorize user reviews
            title: generateTitle(doc.comment, doc.rating),
            content: doc.comment,
            likes: doc._count.reviewLikes,
            comments: doc._count.reviewComments,
            date: doc.createdAt.toLocaleDateString("vi-VN"),
            helpful: false,
            userId: doc.userId,
            status: doc.status,
            isUserReview: true
        }))

        // 3. Combine Reviews
        let allReviews = [...mappedUserReviews, ...jsonReviews]

        if (category && category !== "Tất cả") {
            allReviews = allReviews.filter((r) => r.category === category)
        }

        // 4. Get liked review IDs for the user
        let likedReviewIds: string[] = []
        if (userId) {
            const userLikes = await prisma.reviewLike.findMany({
                where: { userId }
            })
            likedReviewIds = userLikes.map(l => l.reviewId)
        }

        return NextResponse.json({
            success: true,
            reviews: allReviews,
            total: allReviews.length,
            likedReviewIds,
            source: "mixed"
        })
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, rating, content, category, title } = body

        if (!userId || !rating || !content) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        })

        const newReview = await prisma.userReview.create({
            data: {
                userId,
                rating: Number(rating),
                comment: content,
                status: 'active', // Direct reviews from students are usually active OR pending moderation
                // Add title and category if you have them in the model. 
                // Currently schema.prisma only has userId, rating, comment, createdAt, status, likes.
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

        // Admin Notification
        await prisma.notification.create({
            data: {
                targetRole: 'admin',
                type: 'system',
                title: 'Đánh giá mới',
                message: `${user?.name || 'Người dùng'} vừa gửi một đánh giá mới.`,
                link: '/dashboard/reviews'
            }
        })

        return NextResponse.json({
            success: true,
            message: "Đánh giá đã được gửi thành công!",
            review: {
                ...newReview,
                id: newReview.id,
                _id: newReview.id,
                author: newReview.user.name,
                likes: 0,
                comments: 0
            }
        })
    } catch (error) {
        console.error("Error submitting review:", error)
        return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const userId = searchParams.get("userId")

        if (!id || !userId) {
            return NextResponse.json({ success: false, error: "Missing id or userId" }, { status: 400 })
        }

        const review = await prisma.userReview.findUnique({
            where: { id }
        })

        if (!review) {
            return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 })
        }

        if (review.userId !== userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
        }

        await prisma.userReview.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Đánh giá đã được xóa" })
    } catch (error) {
        console.error("Delete review error:", error)
        return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 })
    }
}

