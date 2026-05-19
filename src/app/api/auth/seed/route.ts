import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"

// Demo users to seed
const demoUsers = [
    {
        email: "admin@gdu.edu.vn",
        password: "admin123",
        name: "Admin GDU",
        role: "admin",
        phone: "0909123456",
        avatar: "",
    },
    {
        email: "student@gdu.edu.vn",
        password: "student123",
        name: "Nguyen Van A",
        role: "student",
        phone: "0909234567",
        studentId: "GDU2024001",
        major: "Công nghệ thông tin",
        avatar: "",
    },
    {
        email: "employer@company.com",
        password: "employer123",
        name: "Tran Thi B",
        role: "employer",
        phone: "0909345678",
        avatar: "",
    },
]

export async function GET() {
    try {
        const results = []

        for (const user of demoUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10)
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            })

            if (existing) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: {
                        password: hashedPassword,
                        name: user.name,
                        role: user.role,
                        phone: user.phone,
                        avatar: user.avatar,
                        ...(user.role === "student" && {
                            studentId: user.studentId,
                            major: user.major,
                        }),
                    }
                })
                results.push({ email: user.email, status: "updated" })
            } else {
                const { password, ...userWithoutPassword } = user
                await prisma.user.create({
                    data: {
                        ...userWithoutPassword,
                        password: hashedPassword,
                    } as any
                })
                results.push({ email: user.email, status: "created" })
            }
        }

        return NextResponse.json({
            success: true,
            message: "Demo users seeded successfully",
            results,
        })
    } catch (error) {
        console.error("Seed error:", error)
        return NextResponse.json({ error: "Failed to seed demo users" }, { status: 500 })
    }
}

