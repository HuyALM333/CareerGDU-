import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import statsData from "@/data/reviews-stats.json"

export async function GET(request: Request) {
    try {
        // 1. Get static stats from JSON
        const staticStats: any = statsData || {
            total_reviews: 0,
            average_rating: 0,
            rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            verified_count: 0
        }

        // 2. Get live stats from Prisma
        const liveStatsAgg = await prisma.userReview.aggregate({
            _count: { id: true },
            _avg: { rating: true }
        })

        const liveDistribution = await prisma.userReview.groupBy({
            by: ['rating'],
            _count: { id: true }
        })

        // Merge logic
        const totalLiveReviews = liveStatsAgg._count.id
        const avgLiveRating = liveStatsAgg._avg.rating || 0

        const totalReviews = staticStats.total_reviews + totalLiveReviews
        const averageRating = totalReviews > 0 
            ? (staticStats.average_rating * staticStats.total_reviews + avgLiveRating * totalLiveReviews) / totalReviews
            : 0

        const ratingDistribution = { ...staticStats.rating_distribution }
        liveDistribution.forEach(dist => {
            const star = dist.rating.toString()
            ratingDistribution[star] = (ratingDistribution[star] || 0) + dist._count.id
        })

        return NextResponse.json({
            success: true,
            stats: {
                total_reviews: totalReviews,
                average_rating: Number(averageRating.toFixed(1)),
                rating_distribution: ratingDistribution,
                verified_count: staticStats.verified_count + totalLiveReviews // Assume live ones are verified for now
            },
            source: "mixed"
        })
    } catch (error) {
        console.error("Error fetching review stats:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
    }
}

