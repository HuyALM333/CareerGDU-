import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role") // Filter by role if needed

        // SECURE: Verify the requester is an admin
        const { cookies } = await import("next/headers")
        const { decrypt } = await import("@/lib/session")
        const cookie = (await cookies()).get("session")?.value
        const session = await decrypt(cookie)

        if (!session || session.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized: Access Denied" }, { status: 403 })
        }

        const where: any = {}
        if (role && role !== 'all') {
            where.role = role
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                createdAt: true,
                updatedAt: true,
                studentId: true,
                major: true,
                faculty: true,
                cohort: true,
                companyName: true,
                website: true,
                address: true,
                description: true,
                size: true,
                contactPerson: true,
                industry: true,
                companyVerification: {
                    select: {
                        companyName: true,
                        taxCode: true,
                        address: true,
                        representative: true,
                        phone: true,
                        websiteOrFacebook: true,
                        licenseFiles: true,
                        status: true,
                        adminNote: true,
                        submittedAt: true,
                        reviewedAt: true
                    }
                }
            }
        })

        const isVerificationComplete = (verification: any) => {
            if (!verification) return false
            const required = [
                verification.companyName,
                verification.taxCode,
                verification.address,
                verification.representative,
                verification.phone,
                verification.websiteOrFacebook
            ]
            const hasAllFields = required.every((value) => typeof value === "string" && value.trim().length > 0)
            const files = Array.isArray(verification.licenseFiles) ? verification.licenseFiles : []
            return hasAllFields && files.length > 0
        }

        return NextResponse.json({
            success: true,
            users: users.map(user => ({
                ...user,
                _id: user.id,
                companyVerificationComplete: isVerificationComplete(user.companyVerification)
            })),
        })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password, role, creatorEmail } = body

        // Root Admin verification
        const adminEmail = process.env.ADMIN_EMAIL
        if (creatorEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền tạo tài khoản trực tiếp." }, { status: 403 })
        }

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })

        if (existingUser) {
            return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role,
                emailVerified: true,
                avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
                status: "active" // Assuming direct creations are active
            }
        })

        return NextResponse.json({
            success: true,
            message: "Tạo tài khoản thành công!",
            userId: newUser.id
        })
    } catch (error) {
        console.error("Create user error:", error)
        return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }
}

