import prisma from "@/database/prisma"

export async function getHeroSlides(page: string = "home") {
    try {
        const query: any = { isActive: true }
        if (page !== "all") {
            query.page = page
        }
        const slides = await prisma.heroSlide.findMany({
            where: query,
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })
        return slides.map(s => ({ ...s, _id: s.id }))
    } catch (error) {
        console.error(`Error fetching hero slides for ${page}:`, error)
        return []
    }
}

export async function getLatestJobs(limit: number = 4) {
    try {
        const now = new Date()
        const startOfToday = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) + 'T00:00:00+07:00')
        const weekAgo = new Date(startOfToday)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const jobs = await prisma.job.findMany({
            where: {
                OR: [
                    {
                        status: "published",
                        OR: [
                            { publishAt: { lte: now } },
                            { publishAt: null, postedAt: { lte: now } }
                        ],
                        AND: [{ OR: [{ expiredAt: null }, { expiredAt: { gte: startOfToday } }] }]
                    },
                    {
                        status: "expired",
                        expiredAt: { gte: weekAgo, lt: startOfToday }
                    }
                ]
                // Simplified deadline check for Prisma/MySQL
            },
            include: {
                applications: {
                    where: { status: "hired" }
                }
            },
            orderBy: { publishAt: 'desc' },
            take: limit * 2 // Fetch more to filter by quantity/hiredCount in memory if needed
        })

        return jobs.slice(0, limit).map(j => ({
            ...j,
            _id: j.id,
            hiredCount: j.applications.length
        }))
    } catch (error) {
        console.error("Error fetching latest jobs:", error)
        return []
    }
}

export async function getSiteConfig(key: string) {
    try {
        const config = await prisma.siteConfig.findUnique({
            where: { key }
        })
        return config ? { ...config, _id: config.id } : null
    } catch (error) {
        console.error(`Error fetching site config for ${key}:`, error)
        return null
    }
}

