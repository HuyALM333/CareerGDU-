// This file formerly imported from jobs.json. 
// Data has been migrated to MongoDB and should be fetched from the API or directly from the DB.

export type Job = {
    _id: string
    title: string
    company: string
    companyId: string
    logo?: string
    logoFit?: "cover" | "contain"
    location: string
    type: "internship" | "full-time" | "part-time" | "freelance"
    field: string
    salary: string
    education?: string
    experience?: string
    salaryMin?: number
    salaryMax?: number
    isNegotiable?: boolean
    deadline: string
    postedAt: string
    publishAt?: string
    approvedAt?: string
    expiredAt?: string
    description: string
    requirements: string[]
    benefits: string[]
    detailedBenefits?: string[]
    relatedMajors?: string[]
    skills?: string[]
    status: "pending" | "scheduled" | "published" | "rejected" | "expired" | "closed" | "request_changes"
    adminFeedback?: string
    applicants: number
    creatorId?: string // Link to employer user
    views?: number
    website?: string
    contactEmail?: string
    contactPhone?: string
    quantity?: number
    hiredCount?: number
}

// allJobs is now empty because data is in the database.
// Components should fetch from the API.
export const allJobs: Job[] = []

// Helper function to get jobs by field - discouraged, use API
export function getJobsByField(field: string): Job[] {
    return []
}

// Helper function to get jobs by company - discouraged, use API
export function getJobsByCompany(companyId: string): Job[] {
    return []
}

// Helper function to get job by ID - discouraged, use API
export function getJobById(id: string): Job | undefined {
    return undefined
}

// Helper function to get featured jobs - discouraged, use API
export function getFeaturedJobs(limit: number = 6): Job[] {
    return []
}
