"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ContactsTable } from "@/components/admin/contacts-table"

export default function MessagesPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [contacts, setContacts] = useState([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== "admin") {
                router.push("/dashboard")
                return
            }
            fetchContacts()
        }
    }, [user, isLoading, router])

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/contacts")
            const data = await res.json()
            if (data.success) {
                const contactsList = data.data.map((c: any) => ({
                    _id: c._id,
                    createdAt: c.createdAt,
                    name: c.name || "N/A",
                    email: c.email || "N/A",
                    phone: c.phone || "",
                    subject: c.subject || "",
                    message: c.message || ""
                }))
                setContacts(contactsList)
            }
        } catch (error) {
            console.error("Failed to fetch messages", error)
        } finally {
            setLoadingData(false)
        }
    }

    if (isLoading || loadingData) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    if (!user || user.role !== "admin") return null

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Liên hệ</h2>
                <p className="text-muted-foreground">Quản lý tin nhắn và liên hệ từ người dùng.</p>
            </div>
            <ContactsTable initialContacts={contacts} />
        </div>
    )
}
