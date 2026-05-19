import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    console.log(`[Login Debug] Email: ${normalizedEmail}, Found: ${!!user}`)

    if (!user) {
      return NextResponse.json({ error: "Email chưa được đăng ký" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log(`[Login Debug] Password Match: ${passwordMatch}`)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 })
    }

    // Check if email is verified
    if (user.emailVerified === false) {
      return NextResponse.json({
        error: "Tài khoản chưa được xác minh",
        needsVerification: true,
        email: user.email
      }, { status: 403 })
    }

    // Check for employer approval status
    if (user.role === "employer" && user.status === "pending") {
      return NextResponse.json({
        error: "Tài khoản đang chờ Admin phê duyệt. Vui lòng kiểm tra email hoặc liên hệ Admin.",
        pendingApproval: true
      }, { status: 403 })
    }

    // Return user with both id and _id for compatibility
    const userResponse = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      studentId: user.studentId,
      major: user.major,
      companyName: user.companyName,
      contactPerson: user.contactPerson
    }

    // 2FA for Admin Role
    if (user.role === "admin") {
      if (user.totpEnabled === true) {
        return NextResponse.json({
          success: true,
          needs2FA: true,
          totpEnabled: true,
          email: user.email,
        })
      }

      if (user.totpEnabled === false) {
        return NextResponse.json({
          success: true,
          needs2FA: true,
          needsTotpSetup: true,
          totpEnabled: false,
          email: user.email,
          userId: user.id,
        })
      }
    }

    // NEW: Create secure session cookie for non-admin users
    const { createSession } = await import("@/lib/session")
    console.log(`[Login Debug] Creating session for: ${userResponse.id}, role: ${userResponse.role}`)
    await createSession(userResponse.id, userResponse.role)

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 })
  }
}

