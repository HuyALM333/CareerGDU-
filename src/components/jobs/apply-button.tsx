"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ApplyJobDialog } from "./apply-job-dialog"

interface ApplyButtonProps {
    jobId: string
    jobTitle: string
    company: string
    employerId?: string
    companyEmail?: string
    companyPhone?: string
    companyWebsite?: string
    jobType?: string
    deadline?: string
    quantity?: number
    hiredCount?: number
}

export function ApplyButton({
    jobId,
    jobTitle,
    company,
    employerId,
    companyEmail,
    companyPhone,
    companyWebsite,
    jobType,
    deadline,
    quantity,
    hiredCount = 0
}: ApplyButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const isEmployer = user?.role === "employer" || user?.role === "admin"

    // Robust date parsing helper (consistent with JobsListClient)
    const parseDateHelper = (dateVal: any): number => {
        if (!dateVal) return 0
        try {
            if (dateVal instanceof Date) return dateVal.getTime()
            if (typeof dateVal === 'string') {
                if (dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    const [day, month, year] = dateVal.split('/').map(Number)
                    return new Date(year, month - 1, day).getTime()
                }
                const date = new Date(dateVal)
                return isNaN(date.getTime()) ? 0 : date.getTime()
            }
            const date = new Date(dateVal)
            return isNaN(date.getTime()) ? 0 : date.getTime()
        } catch {
            return 0
        }
    }

    const timeDeadline = parseDateHelper(deadline)
    const isExpired = (() => {
        if (timeDeadline <= 0) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dDate = new Date(timeDeadline)
        dDate.setHours(0, 0, 0, 0)

        return dDate.getTime() < today.getTime()
    })()
    const isFull = quantity !== undefined && quantity !== -1 && hiredCount >= (quantity || 1)

    const handleApplyClick = () => {
        if (!user) {
            router.push("/login?redirect=/jobs/" + jobId)
            return
        }
        if (isEmployer) return
        setIsDialogOpen(true)
    }

    return (
        <>
            {isFull ? (
                <div className="w-full h-12 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-100 rounded-md">
                    Đã tuyển đủ
                </div>
            ) : (
                <Button
                    onClick={handleApplyClick}
                    disabled={!!isExpired || isEmployer}
                    className={`w-full h-12 text-lg shadow-md transition-all hover:shadow-lg ${isExpired || isEmployer ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed" : "bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"}`}
                >
                    {isExpired ? "Hết hạn" : isEmployer ? "Chỉ dành cho ứng viên" : "Ứng tuyển ngay"}
                </Button>
            )}

            <ApplyJobDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                jobTitle={jobTitle}
                companyName={company}
                jobId={jobId}
                employerId={employerId}
                companyEmail={companyEmail}
                companyPhone={companyPhone}
                companyWebsite={companyWebsite}
                jobType={jobType}
            />
        </>
    )
}
