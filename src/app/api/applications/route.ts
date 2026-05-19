import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { sendEmail } from "@/services/email.service"
import { checkNotificationPreference } from "@/lib/notification-utils"
import { saveBase64Image } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Extract text fields
    const jobTitle = formData.get("jobTitle") as string
    const companyName = formData.get("companyName") as string
    const jobId = formData.get("jobId") as string
    let employerId = formData.get("employerId") as string
    // Student Info
    const fullname = formData.get("fullname") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const mssv = formData.get("mssv") as string
    const major = formData.get("major") as string
    const faculty = formData.get("faculty") as string
    const cohort = formData.get("cohort") as string

    const message = formData.get("message") as string
    const applicantId = formData.get("applicantId") as string // User ID for notifications

    if (!applicantId) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để ứng tuyển" },
        { status: 401 }
      )
    }

    // Verify applicant still exists if logged in
    if (applicantId) {
      const user = await prisma.user.findUnique({ where: { id: applicantId } })
      if (!user) {
        return NextResponse.json({ error: "Tài khoản của bạn không tồn tại hoặc đã bị xóa. Vui lòng đăng xuất và đăng ký lại." }, { status: 401 })
      }
      if (user.role === "employer" || user.role === "admin") {
        return NextResponse.json({ error: "Nhà tuyển dụng hoặc quản trị viên không thể ứng tuyển công việc." }, { status: 403 })
      }
    }

    console.log("[Applications API] POST - jobId:", jobId, "employerId from form:", employerId, "applicantId:", applicantId)

    // Always lookup job if jobId provided for security and deadline validation
    if (jobId) {
      try {
        const job = await prisma.job.findUnique({ where: { id: jobId } })

        if (job) {
          // 1. Sync employerId
          if (job.creatorId) {
            employerId = job.creatorId
            console.log("[Applications API] Found/Verified employerId from job:", employerId)
          }

          // 2. Strict Deadline validation
          if (job.deadline) {
            const timeDeadline = new Date(job.deadline).getTime()
            if (timeDeadline > 0 && timeDeadline < new Date().getTime()) {
              return NextResponse.json({ error: "Công việc này đã hết hạn nhận hồ sơ." }, { status: 403 })
            }
          }
        }
      } catch (lookupError) {
        console.error("[Applications API] Error looking up job:", lookupError)
      }
    }

    // Extract file
    const file = formData.get("cv") as File | null

    // Validate required fields
    if (!fullname || !email || !phone || !mssv || !major) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    // Server-side strict phone validation
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.startsWith('0') || cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có 10-11 chữ số." }, { status: 400 })
    }

    let cvDataUrl = null
    let cvOriginalName = null
    let cvMimeType = null

    // Process file only if it exists
    if (file && file.size > 0) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: "Loại file không hợp lệ" }, { status: 400 })
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "File quá lớn (>20MB)" }, { status: 400 })
      }

      // Convert CV to Base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const cvBase64 = buffer.toString("base64")
      cvDataUrl = `data:${file.type};base64,${cvBase64}`
      cvOriginalName = file.name
      cvMimeType = file.type
    }

    // Tối ưu: Lưu tệp CV vào Local Storage
    let cvPath = null
    if (cvDataUrl) {
      cvPath = await saveBase64Image(cvDataUrl, "cvs")
    }

    // Start Transaction to create application and update job count
    const result = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId,
          userId: applicantId, // BẮT BUỘC vì schema có relation

          name: fullname,
          email,
          phone,
          studentId: mssv,
          major,
          gpa: null,

          coverLetter: message || null,

          cvUrl: cvPath,
          cvOriginalName: cvOriginalName,
          cvType: cvMimeType,

          status: "pending"
        }
      })

      // Increment applicants count
      if (jobId) {
        await tx.job.update({
          where: { id: jobId },
          data: { applicants: { increment: 1 } }
        })
      }

      return app
    })

    const applicationId = result.id

    // Create Notifications
    // 1. Notification for Admin
    try {
      await prisma.notification.create({
        data: {
          targetRole: 'admin',
          type: 'job',
          title: 'Hồ sơ ứng tuyển mới',
          message: `${fullname} vừa ứng tuyển vị trí ${jobTitle} tại ${companyName}`,
          read: false,
          link: `/dashboard/applicants-manager?id=${applicationId}`,
          applicationId: applicationId
        }
      })
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError)
    }

    // 2. Notification for Employer
    if (employerId && employerId !== applicantId) {
      try {
        await prisma.notification.create({
          data: {
            userId: employerId,
            type: 'job',
            title: 'Ứng viên mới ứng tuyển',
            message: `${fullname} vừa ứng tuyển vị trí ${jobTitle}`,
            read: false,
            link: `/dashboard/applicants-manager?id=${applicationId}`,
            applicationId: applicationId
          }
        })
      } catch (notifError) {
        console.error("Failed to create employer notification:", notifError)
      }
    }

    // 3. Notification for Student/Applicant
    if (applicantId) {
      try {
        await prisma.notification.create({
          data: {
            userId: applicantId,
            type: 'job',
            title: 'Ứng tuyển thành công',
            message: `Bạn đã ứng tuyển thành công vào vị trí ${jobTitle} tại ${companyName}. Chúc bạn may mắn!`,
            read: false,
            link: `/dashboard/applications`,
            applicationId: applicationId
          }
        })
      } catch (notifError) {
        console.error("Failed to create student notification:", notifError)
      }
    }

    // 3. Send Email Notifications
    const host = request.headers.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'https://career-web-three.vercel.app')
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    const applicationLink = `${cleanBaseUrl}/dashboard/applicants-manager?id=${applicationId}`

    const emailSubject = `[GDU Career] Hồ sơ ứng tuyển mới: ${jobTitle}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">GDU Career Portal</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Có ứng viên mới!</h2>
          <p><strong>Vị trí:</strong> ${jobTitle}</p>
          <p><strong>Công ty:</strong> ${companyName}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <h3 style="color: #333;">Thông tin ứng viên:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;"><strong>Họ tên:</strong> ${fullname}</li>
            <li style="padding: 8px 0;"><strong>Email:</strong> ${email}</li>
            <li style="padding: 8px 0;"><strong>Số điện thoại:</strong> ${phone}</li>
            <li style="padding: 8px 0;"><strong>MSSV:</strong> ${mssv}</li>
            <li style="padding: 8px 0;"><strong>Ngành:</strong> ${major}</li>
            <li style="padding: 8px 0;"><strong>CV:</strong> ${cvOriginalName || 'Không đính kèm'}</li>
            ${message ? `<li style="padding: 8px 0;"><strong>Lời nhắn:</strong> ${message}</li>` : ''}
          </ul>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${applicationLink}" 
               style="background-color: #1e3a5f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Xem hồ sơ chi tiết
            </a>
          </div>
        </div>
      </div>
    `

    // Send emails
    if (process.env.ADMIN_EMAIL) {
      try {
        const adminUser = await prisma.user.findUnique({ where: { email: process.env.ADMIN_EMAIL } })
        const shouldSendAdminEmail = await checkNotificationPreference(adminUser?.id, 'email')
        if (shouldSendAdminEmail) {
          await sendEmail({ to: process.env.ADMIN_EMAIL, subject: emailSubject, html: emailHtml })
        }
      } catch (err) { console.error("Admin email failed", err) }
    }

    if (employerId) {
      try {
        const employer = await prisma.user.findUnique({ where: { id: employerId } })
        if (employer?.email) {
          const shouldSendEmployerEmail = await checkNotificationPreference(employerId, 'email')
          if (shouldSendEmployerEmail) {
            await sendEmail({ to: employer.email, subject: emailSubject, html: emailHtml })
          }
        }
      } catch (err) { console.error("Employer email failed", err) }
    }

    return NextResponse.json(
      { success: true, message: "Ứng tuyển thành công", applicationId: applicationId },
      { status: 200 }
    )
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    // ===== GET SESSION =====
    const { cookies } = await import("next/headers")
    const { decrypt } = await import("@/lib/session")

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value
    const session = await decrypt(sessionCookie)

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId as string
    const userRole = session.role as string

    let where: any = {}

    // ===== ROLE LOGIC =====
    if (userRole === "admin") {
      // Admin thấy tất cả
    } 
    else if (userRole === "employer") {
    // Employer thấy application thuộc job mình tạo
    where.job = {
      is: {
        creatorId: userId
      }
    }
  }
    else {
      // Student: lấy theo userId (FIX ISSUE 3)
      const currentUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!currentUser) {
        return NextResponse.json({ success: true, data: [] })
      }

      where.OR = [
        { userId: userId },                 // ✅ FIX CHÍNH
        { email: currentUser.email }        // fallback
      ]
    }

    // ===== FILTER THEO JOB =====
    if (jobId) {
      where.jobId = jobId
    }

    // ===== QUERY =====
    const applications = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            creatorId: true
          }
        }
      }
    })

    // ===== MAP DATA =====
    const mappedApplications = applications.map(app => ({
      ...app,
      _id: app.id // giữ compatibility FE
    }))

    return NextResponse.json({
      success: true,
      data: mappedApplications
    })

  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

