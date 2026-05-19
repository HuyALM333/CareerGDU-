"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function VisitorTracker() {
    const pathname = usePathname()
    const { user } = useAuth()
    const hasTracked = useRef(false)
    const lastPage = useRef<string | null>(null)

    useEffect(() => {
        // Track each page view during session
        const trackVisit = async () => {
            // Skip if same page
            if (lastPage.current === pathname) return
            lastPage.current = pathname

            try {
                await fetch("/api/visitors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        page: pathname,
                        userId: user?.id || null,
                        userName: user?.name || null,
                        referrer: typeof document !== "undefined" ? document.referrer : null,
                    }),
                })
            } catch (error) {
                // Silent fail - don't interrupt user experience
                console.error("Visitor tracking error:", error)
            }
        }

        // Delay slightly to ensure page has loaded
        const timeout = setTimeout(trackVisit, 500)
        return () => clearTimeout(timeout)
    }, [pathname, user?.id, user?.name])

    return null // This component doesn't render anything
}
