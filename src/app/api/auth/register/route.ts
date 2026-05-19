import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendEmail } from "../../../../services/email.service"

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP for secure storage
function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role: requestedRole, studentId, major } = body
    const role = requestedRole === "admin" ? "student" : (requestedRole || "student")

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Validate phone number format
    if (phone && !/^0\d{9,10}$/.test(phone)) {
      return NextResponse.json({ error: "Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if email exists in main USERS table (Verified accounts)
    const existingVerifiedUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        emailVerified: true
      }
    })

    if (existingVerifiedUser) {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })
    }

    // 2. Check if user exists in PendingUser or is unverified in User
    let pendingUser = await prisma.pendingUser.findUnique({
      where: { email: normalizedEmail }
    })
    let foundInPending = !!pendingUser

    let unverifiedUser = null
    if (!pendingUser) {
      unverifiedUser = await prisma.user.findFirst({
        where: { email: normalizedEmail, emailVerified: false }
      })
    }

    if (pendingUser || unverifiedUser) {
      // Generate new OTP
      const otp = generateOTP()
      const hashedOTP = hashOTP(otp)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

      const hashedPassword = await bcrypt.hash(password, 10)

      // Update the relevant table
      if (foundInPending) {
        await prisma.pendingUser.update({
          where: { email: normalizedEmail },
          data: {
            name,
            password: hashedPassword,
            phone,
            role,
            studentId,
            major,
            emailOtp: hashedOTP,
            emailOtpExpires: expiresAt
          }
        })
      } else if (unverifiedUser) {
        await prisma.user.update({
          where: { id: unverifiedUser.id },
          data: {
            name,
            password: hashedPassword,
            phone,
            role,
            studentId,
            major,
            emailOtp: hashedOTP,
            emailOtpExpires: expiresAt
          }
        })
      }

      // Send OTP email (non-blocking)
      sendEmail({
        to: email,
        subject: "Mã xác minh tài khoản GDU Career",
        html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                  <p style="margin: 10px 0 0; opacity: 0.9;">Xác minh tài khoản</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${name}!</h2>
                  <p style="color: #666;">Đây là mã xác minh mới của bạn:</p>
                  <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                    ${otp}
                  </div>
                  <p style="color: #999; font-size: 14px; text-align: center;">Mã này sẽ hết hạn sau <strong>5 phút</strong></p>
                </div>
              </div>
            `,
      }).catch(err => console.error("Background email error:", err))

      return NextResponse.json({
        success: true,
        needsVerification: true,
        email: email,
        message: "Tài khoản đang chờ xác minh. Mã OTP mới đã được gửi.",
      })
    }

    // Check if studentId already exists (only for students)
    if (role === "student") {
      if (!studentId || !/^\d{8}$/.test(studentId)) {
        return NextResponse.json({ error: "Mã số sinh viên phải có đủ 8 số" }, { status: 400 })
      }

      const existingStudentId = await prisma.user.findFirst({
        where: { studentId }
      })
      if (existingStudentId) {
        return NextResponse.json({ error: "Mã số sinh viên đã được đăng ký" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOTP()

    // Prepare new user data for PendingUser table
    const pendingData: any = {
      name,
      password: hashedPassword,
      role: role,
      email: normalizedEmail,
      phone: phone || "",
      emailVerified: false,
      status: role === "employer" ? "pending" : "active",
      avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
      emailOtp: hashOTP(otp),
      emailOtpExpires: new Date(Date.now() + 5 * 60 * 1000)
    }

    if (role === "student") {
      pendingData.studentId = studentId || ""
      pendingData.major = major || ""
    }

    if (role === "employer") {
      pendingData.contactPerson = body.contactPerson || ""
      pendingData.companyName = body.companyName || ""
      pendingData.companyType = body.companyType || ""
      pendingData.companySize = body.companySize || ""
      pendingData.foreignCapital = body.foreignCapital || false
      pendingData.province = body.province || ""
      pendingData.industry = body.industry || ""
      pendingData.address = body.address || ""
    }

    // Insert into PendingUser table
    await prisma.pendingUser.create({
      data: pendingData
    })

    // Send Email OTP (non-blocking)
    sendEmail({
      to: email,
      subject: "Mã xác minh tài khoản GDU Career",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">GDU Career Portal</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Chào mừng bạn đến với GDU Career!</p>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e3a5f; margin-top: 0;">Xin chào ${name}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                      Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhập mã xác minh dưới đây để hoàn tất:
                    </p>
                    <div style="background: #1e3a5f; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">
                      Mã này sẽ hết hạn sau <strong>5 phút</strong>
                    </p>
                  </div>
                </div>
              `,
    }).catch(err => console.error("Background email error:", err))

    // Notify Admin
    try {
      const isEmployer = role === "employer"
      await prisma.notification.create({
        data: {
          targetRole: "admin",
          type: "system",
          title: isEmployer ? "Yêu cầu đăng ký Nhà tuyển dụng mới" : "Người dùng mới đăng ký",
          message: isEmployer
            ? `${pendingData.companyName || name} vừa đăng ký. Chờ xác minh email và phê duyệt.`
            : `${name} vừa đăng ký tài khoản sinh viên.`,
          read: false,
          link: isEmployer ? "/dashboard/users?role=employer" : "/dashboard/users"
        }
      })
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError)
    }

    return NextResponse.json({
      success: true,
      needsVerification: true,
      email: email,
      message: "Đăng ký thành công! Vui lòng xác minh tài khoản.",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}

