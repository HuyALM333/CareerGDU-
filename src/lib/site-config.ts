import prisma from "@/database/prisma"

export async function getSiteConfig(key: string) {
    try {
        const config = await prisma.siteConfig.findFirst({
            where: { key, isActive: true }
        })
        return config
    } catch (error) {
        console.error(`Error getting site config for ${key}:`, error)
        return null
    }
}

export async function getAllSiteConfigs() {
    try {
        const configs = await prisma.siteConfig.findMany({
            where: { isActive: true }
        })
        return configs
    } catch (error) {
        console.error("Error getting all site configs:", error)
        return []
    }
}

