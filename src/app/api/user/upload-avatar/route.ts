import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { saveFile } from "@/lib/storage"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File
        const userId = formData.get("userId") as string

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, GIF allowed." }, { status: 400 })
        }

        // Save image to Local Storage
        const avatarUrl = await saveFile(file, "avatars")

        // Update user in MySQL using Prisma
        await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl }
        })

        return NextResponse.json({
            success: true,
            url: avatarUrl,
            message: "Avatar uploaded successfully"
        })

    } catch (error) {
        console.error("[API] Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}

