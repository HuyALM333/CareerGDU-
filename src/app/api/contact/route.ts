import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { sendEmail } from "@/services/email.service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: "new"
      }
    })

    // Create Notification for Admin
    await prisma.notification.create({
      data: {
        targetRole: 'admin',
        type: 'message',
        title: 'Liên hệ mới',
        message: `${name} vừa gửi một liên hệ mới: ${subject}`,
        link: `/dashboard/messages`,
        contactId: contact.id
      }
    })

    // Send Email to Admin
    if (process.env.ADMIN_EMAIL) {
      try {
        const host = request.headers.get('host')
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000')
        const messageLink = `${baseUrl.replace(/\/$/, '')}/dashboard/messages`

        await sendEmail({
          to: process.env.ADMIN_EMAIL as string,
          subject: `[GDU Career] Liên hệ mới từ ${name}: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #0F52BA; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Liên hệ mới</h2>
              </div>
              <div style="padding: 20px; line-height: 1.6;">
                <p>Bạn nhận được một tin nhắn liên hệ mới từ hệ thống:</p>
                <div style="background-color: #f5f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Người gửi:</strong> ${name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${phone || "N/A"}</p>
                  <p style="margin: 5px 0;"><strong>Chủ đề:</strong> ${subject}</p>
                </div>
                <div style="border-left: 4px solid #0F52BA; padding-left: 15px; font-style: italic; color: #555;">
                  ${message.replace(/\n/g, '<br/>')}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${messageLink}" 
                     style="background-color: #0F52BA; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Xem chi tiết trong Dashboard
                  </a>
                </div>
              </div>
              <div style="background-color: #f9f9f9; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                <p>Email này được gửi tự động từ GDU Career Portal.</p>
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error("Failed to send contact email to admin:", emailError)
      }
    }

    return NextResponse.json({
        success: true,
        message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

