import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "jobs" | "reviews" | "users"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n")
    if (lines.length < 2) {
        return NextResponse.json({ success: false, error: "Empty or invalid CSV file" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h) => h.trim())

    const records = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",")
      const record: Record<string, any> = {}

      headers.forEach((header, index) => {
        let val: any = values[index]?.trim() || ""
        // Basic type conversion
        if (header === "rating" || header === "likes" || header === "views" || header === "applicants" || header === "quantity") {
            val = parseInt(val) || 0
        }
        if (header === "isActive" || header === "verified") {
            val = val === "true" || val === "1"
        }
        record[header] = val
      })

      records.push(record)
    }

    let resultCount = 0
    if (type === "jobs") {
        const { count } = await prisma.job.createMany({
            data: records.map(({ id, _id, ...r }) => ({ 
                ...r,
                postedAt: r.postedAt ? new Date(r.postedAt) : new Date()
            })) as any,
            skipDuplicates: true
        })
        resultCount = count
    } else if (type === "reviews") {
        const { count } = await prisma.userReview.createMany({
            data: records.map(({ id, _id, ...r }) => ({
                ...r,
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
            })) as any,
            skipDuplicates: true
        })
        resultCount = count
    } else if (type === "users") {
        const { count } = await prisma.user.createMany({
            data: records.map(({ id, _id, ...r }) => ({
                ...r,
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
            })) as any,
            skipDuplicates: true
        })
        resultCount = count
    }


    return NextResponse.json({
      success: true,
      message: `Imported ${resultCount} records successfully`,
      data: {
        type,
        count: resultCount,
        sample: records.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ success: false, error: "Failed to import CSV" }, { status: 500 })
  }
}

