"use client"

import { useEffect, useRef } from "react"

export function ViewTracker({ jobId }: { jobId: string }) {
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            fetch(`/api/jobs/${jobId}/view`, { method: "POST" })
                .catch(err => console.error("Failed to track view", err))
        }
    }, [jobId])

    return null
}
