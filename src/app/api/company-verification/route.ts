import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { saveBase64Image } from "@/lib/storage"

const REQUIRED_FIELDS = [
    "companyName",
    "taxCode",
    "address",
    "representative",
    "phone",
    "websiteOrFacebook",
] as const

type LicenseInput =
    | string
    | {
        data?: string
        url?: string
        name?: string
    }

const isComplete = (data: any) => {
    if (!data) return false
    const hasAllFields = REQUIRED_FIELDS.every((key) => {
        const value = data[key]
        return typeof value === "string" && value.trim().length > 0
    })
    const files = Array.isArray(data.licenseFiles) ? data.licenseFiles : []
    return hasAllFields && files.length > 0
}

const normalizeString = (value?: string | null) => (value ? value.trim() : null)

const normalizeLicenseFiles = async (licenseFiles: LicenseInput[]) => {
    const files = Array.isArray(licenseFiles) ? licenseFiles : []

    const saved = await Promise.all(
        files.map(async (file) => {
            if (typeof file === "string") {
                if (file.startsWith("data:")) {
                    const url = await saveBase64Image(file, "documents")
                    return url ? { url } : null
                }
                return { url: file }
            }

            if (file?.data && file.data.startsWith("data:")) {
                const url = await saveBase64Image(file.data, "documents")
                return url ? { url, name: file.name || null } : null
            }

            if (file?.url) {
                return { url: file.url, name: file.name || null }
            }

            return null
        })
    )

    return saved.filter(Boolean)
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }

        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || (session.userId !== userId && session.role !== "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
        }

        const verification = await prisma.companyVerification.findUnique({
            where: { userId },
        })

        const complete = isComplete(verification)

        return NextResponse.json({
            success: true,
            data: verification,
            isComplete: complete,
        })
    } catch (error) {
        console.error("[CompanyVerification GET] error:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch verification" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            userId,
            companyName,
            taxCode,
            address,
            representative,
            phone,
            websiteOrFacebook,
            licenseFiles = [],
        } = body

        if (!userId) {
            return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
        }

        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || (session.userId !== userId && session.role !== "admin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
        }

        const normalizedFiles = await normalizeLicenseFiles(licenseFiles)

        const updateData = {
            companyName: normalizeString(companyName),
            taxCode: normalizeString(taxCode),
            address: normalizeString(address),
            representative: normalizeString(representative),
            phone: normalizeString(phone),
            websiteOrFacebook: normalizeString(websiteOrFacebook),
            licenseFiles: normalizedFiles,
        }

        const existing = await prisma.companyVerification.findUnique({
            where: { userId },
        })

        const draft = {
            ...updateData,
            userId,
        }

        const complete = isComplete(draft)

        let statusToSet = existing?.status || "UNVERIFIED"
        let submittedAt = existing?.submittedAt || null
        let adminNoteToSet: string | null | undefined = existing?.adminNote || null

        if (complete && (statusToSet === "UNVERIFIED" || statusToSet === "REJECTED")) {
            statusToSet = "UNDER_REVIEW"
            submittedAt = new Date()
            adminNoteToSet = null
        }

        const verification = await prisma.companyVerification.upsert({
            where: { userId },
            update: {
                ...updateData,
                status: statusToSet,
                submittedAt,
                adminNote: adminNoteToSet,
            },
            create: {
                ...draft,
                status: statusToSet,
                submittedAt,
            },
        })

        return NextResponse.json({
            success: true,
            data: verification,
            isComplete: isComplete(verification),
        })
    } catch (error) {
        console.error("[CompanyVerification POST] error:", error)
        return NextResponse.json({ success: false, error: "Failed to save verification" }, { status: 500 })
    }
}
