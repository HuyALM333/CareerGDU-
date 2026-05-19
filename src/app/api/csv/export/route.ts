import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "reviews"

    let data: Record<string, any>[] = []
    let headers: string[] = []

    if (type === "reviews") {
      headers = ["id", "author", "rating", "content", "createdAt", "likes", "status"]
      const reviews = await prisma.userReview.findMany({
          orderBy: { createdAt: 'desc' },
          include: { user: true }
      })
      data = reviews.map(r => ({
          ...r,
          author: r.user.name,
          createdAt: r.createdAt.toISOString().split('T')[0]
      }))
    } else if (type === "jobs") {
      headers = ["id", "title", "company", "location", "type", "salary", "deadline", "status", "applicants"]
      const jobs = await prisma.job.findMany({
          orderBy: { postedAt: 'desc' }
      })
      data = jobs.map(j => ({
          ...j,
          deadline: j.deadline || "N/A"
      }))
    } else if (type === "users") {
      headers = ["id", "name", "email", "role", "status", "createdAt"]
      const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
      })
      data = users.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString().split('T')[0]
      }))
    }

    // Generate CSV content
    const csvLines = [headers.join(",")]
    data.forEach((row) => {
      const values = headers.map((h) => {
          const val = row[h];
          return String(val === null || val === undefined ? "" : val).replace(/,/g, ";").replace(/\n/g, " ")
      })
      csvLines.push(values.join(","))
    })

    const csvContent = csvLines.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${type}_export_${Date.now()}.csv`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ success: false, error: "Failed to export CSV" }, { status: 500 })
  }
}

