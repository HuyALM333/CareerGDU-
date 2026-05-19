import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { saveBase64Image } from "@/lib/storage"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const field = searchParams.get("field")
    const search = searchParams.get("search")?.toLowerCase()
    const creatorId = searchParams.get("creatorId")

    const now = new Date()
    // Normalizing today to start of day in +07:00 for deadline comparison
    const startOfToday = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) + 'T00:00:00+07:00')

    // Auto status update for scheduled/published/expired
    await prisma.job.updateMany({
      where: {
        status: "scheduled",
        publishAt: { lte: now },
        OR: [{ expiredAt: null }, { expiredAt: { gte: now } }]
      },
      data: { status: "published" }
    })

    await prisma.job.updateMany({
      where: {
        status: { in: ["published", "scheduled"] },
        expiredAt: { lt: now }
      },
      data: { status: "expired" }
    })

    const where: any = {}

    const isPublicDefault = !creatorId && !status

    // 1. Creator and Status Filter
    if (creatorId) {
      where.creatorId = creatorId
      if (status && status !== "all") {
        where.status = status
      }
    } else if (status && status !== "all") {
      where.status = status
    }

    // 2. Type and Field Filters
    if (type && type !== "all") {
      where.type = type
    }
    if (field && field !== "all") {
      where.field = field
    }

    // 3. Search Filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 4. Public View Expiration and Filling Logic
    if (!creatorId && (isPublicDefault || where.status === "published")) {
      // Note: MongoDB deadline was a mix of Strings and Dates. 
      // In Prisma/MySQL, it's also a String per schema for compatibility.
      // Complex deadline parsing is harder in pure SQL but we can approximate or use application side filtering if needed.
      // For now, we'll keep it simple and filter by status and basic conditions.
      const weekAgo = new Date(startOfToday)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const searchOr = where.OR
      if (searchOr) delete where.OR

      const publishedWindow = {
        status: "published",
        OR: [
          { publishAt: { lte: now } },
          { publishAt: null, postedAt: { lte: now } }
        ],
        AND: [{ OR: [{ expiredAt: null }, { expiredAt: { gte: startOfToday } }] }]
      }

      const expiredWindow = {
        status: "expired",
        expiredAt: { gte: weekAgo, lt: startOfToday }
      }

      where.AND = [
        ...(searchOr ? [{ OR: searchOr }] : []),
        { OR: [publishedWindow, expiredWindow] }
      ]
    }

    // Execute query with hired count
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { publishAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        website: true,
        companyId: true,
        logo: true,
        location: true,
        type: true,
        field: true,
        experience: true,
        education: true,
        salary: true,
        salaryMin: true,
        salaryMax: true,
        isNegotiable: true,
        deadline: true,
        postedAt: true,
        approvedAt: true,
        publishAt: true,
        expiredAt: true,
        status: true,
        applicants: true,
        views: true,
        quantity: true,
        contactEmail: true,
        contactPhone: true,
        documentUrl: true,
        documentName: true,
        logoFit: true,
        creatorId: true,
        _count: {
          select: {
            applications: {
              where: { status: "hired" }
            }
          }
        }
      }
    })

    // 5. Post-filtering for hiredCount (keep full jobs visible)
    const filteredJobs = jobs

    // Map id to _id for frontend compatibility if necessary, or just use id
    const mappedJobs = filteredJobs.map(job => ({
      ...job,
      postedAt: job.publishAt || job.postedAt,
      _id: job.id, // Keeping _id for frontend compatibility during transition
      hiredCount: job._count.applications
    }))

    return NextResponse.json({
      success: true,
      data: {
        jobs: mappedJobs,
        total: mappedJobs.length,
      },
    })
  } catch (error) {
    console.error("Error reading jobs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title, company, companyId, location, type, field,
      experience, education,
      salary, salaryMin, salaryMax, isNegotiable,
      deadline, description, requirements, benefits,
      relatedMajors, detailedBenefits, creatorId, role, website, quantity,
      contactEmail, contactPhone, documentUrl, documentName, logoFit, postedAt
    } = body

    // 1. Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: creatorId }
    })

    if (!userExists) {
      return NextResponse.json({ error: "Tài khoản không tồn tại hoặc đã bị xóa." }, { status: 401 })
    }

    // 2. Save logo
    const logoUrl = await saveBase64Image(body.logo, "logos")

    // 🔥 NEW: Save document
    let documentFileUrl = null

    if (body.documentUrl && typeof body.documentUrl === "string") {
      if (body.documentUrl.startsWith("data:")) {
        const uploaded = await saveBase64Image(body.documentUrl, "documents")
        if (!uploaded) {
          return NextResponse.json(
            { error: "Upload file thất bại" },
            { status: 400 }
          )
        }

        documentFileUrl = uploaded
      } else {
        documentFileUrl = body.documentUrl
      }
    }

    // 3. Create Job
    const parsedPublishAt = postedAt ? new Date(postedAt) : new Date()
    const publishAtValue = !isNaN(parsedPublishAt.getTime()) ? parsedPublishAt : new Date()

    let expiredAtValue: Date | null = null
    if (deadline && typeof deadline === "string") {
      const parsedDeadline = deadline.includes("/")
        ? new Date(deadline.split("/").reverse().join("-"))
        : new Date(deadline)
      if (!isNaN(parsedDeadline.getTime())) {
        expiredAtValue = parsedDeadline
      }
    }

    const now = new Date()
    const isAdmin = role === "admin"
    const nextStatus = isAdmin
      ? (publishAtValue > now ? "scheduled" : "published")
      : "pending"

    const newJob = await prisma.job.create({
      data: {
        title,
        company,
        website: website || null,
        companyId: companyId || "unknown",
        logo: logoUrl || "/placeholder.svg",
        location,
        type,
        field,
        experience: experience || null,
        education: education || null,
        salary: isNegotiable ? "Thỏa thuận" : salary,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        isNegotiable: isNegotiable || false,
        deadline,
        description,
        requirements: requirements || [],
        benefits: benefits || [],
        detailedBenefits: detailedBenefits || [],
        relatedMajors: relatedMajors || [],
        status: nextStatus,
        quantity: quantity || 1,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        approvedAt: isAdmin ? now : null,
        publishAt: publishAtValue,
        expiredAt: expiredAtValue,
        postedAt: publishAtValue,

        // 🔥 FIX
        documentUrl: documentFileUrl,
        documentName: documentName || null,

        logoFit: logoFit || "cover",
        creatorId
      }
    })

    // 4. Create Notification for Admin if pending
    if (newJob.status === 'pending') {
      try {
        await prisma.notification.create({
          data: {
            targetRole: 'admin',
            type: 'job',
            title: 'Tin tuyển dụng mới cần duyệt',
            message: `${company} vừa đăng tin tuyển dụng: ${title}`,
            read: false,
            link: '/dashboard/jobs',
          }
        })
      } catch (notifError) {
        console.error("Failed to create admin notification:", notifError)
      }
    }

    return NextResponse.json({
      success: true,
      message: role === 'admin' ? "Đăng tuyển thành công!" : "Đã gửi duyệt tin tuyển dụng!",
      data: { ...newJob, _id: newJob.id },
    })
  } catch (error) {
    console.error("Post job error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to post job" },
      { status: 500 }
    )
  }
}

