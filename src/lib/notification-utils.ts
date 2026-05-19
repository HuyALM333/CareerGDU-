import prisma from "@/database/prisma"

export type NotificationType = 'email' | 'push' | 'newJobs'

/**
 * Checks if a user has enabled a specific notification type.
 * Defaults to true for email and newJobs, false for push if not set.
 */
export async function checkNotificationPreference(
    userId: string | null | undefined,
    type: NotificationType
): Promise<boolean> {
    if (!userId) return true // Default to true if no user associated (e.g. system alerts)

    try {
        const user = await (prisma.user as any).findUnique({
            where: { id: userId },
            select: { notificationSettings: true }
        })

        if (!user || !user.notificationSettings) {
            // Default settings if none exist
            if (type === 'push') return false
            return true
        }

        const settings = user.notificationSettings as any
        return settings[type] ?? (type === 'push' ? false : true)

    } catch (error) {
        console.error(`Error checking notification preference for ${userId}:`, error)
        return true // Default to sending if check fails to ensure critical info isn't lost
    }
}

