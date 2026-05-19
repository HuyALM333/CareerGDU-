import { NextResponse } from 'next/server'
import prisma from '@/database/prisma'
import { sendEmail } from '@/services/email.service'
import { checkNotificationPreference } from '@/lib/notification-utils'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {}
        if (status && status !== 'all') {
            where.status = status
        }

        const reports = await prisma.report.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ success: true, reports })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi khi tải danh sách báo cáo' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { jobId, jobTitle, companyName, reporterName, reporterPhone, reporterEmail, content, userId } = body

        if (!jobId || !content || !reporterName || !reporterPhone) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
        }

        const report = await prisma.report.create({
            data: {
                jobId,
                jobTitle,
                companyName,
                reporterName,
                reporterPhone,
                reporterEmail,
                reporterUserId: userId,
                content,
                status: 'pending'
            }
        })

        // Notify admins via Web and Email
        try {
            await prisma.notification.create({
                data: {
                    targetRole: 'admin',
                    type: 'system',
                    title: 'Báo cáo tin tuyển dụng mới',
                    message: `Tin tuyển dụng "${jobTitle}" của ${companyName} vừa bị báo cáo bởi ${reporterName}.`,
                    link: '/dashboard/admin/reports'
                }
            })

            // Send Email to Admin
            if (process.env.ADMIN_EMAIL) {
                const adminUser = await prisma.user.findUnique({
                    where: { email: process.env.ADMIN_EMAIL },
                    select: { id: true }
                })
                
                const shouldSendAdminEmail = adminUser ? await checkNotificationPreference(adminUser.id, 'email') : false

                if (shouldSendAdminEmail) {
                    const host = req.headers.get('host')
                    const protocol = host?.includes('localhost') ? 'http' : 'https'
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000')
                    const reportLink = `${baseUrl.replace(/\/$/, '')}/dashboard/admin/reports`

                    await sendEmail({
                        to: process.env.ADMIN_EMAIL as string,
                        subject: `[GDU Career] Báo cáo vi phạm mới: ${jobTitle}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffeded; border-radius: 8px; overflow: hidden;">
                                <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
                                    <h2 style="margin: 0;">Cảnh báo báo cáo vi phạm</h2>
                                </div>
                                <div style="padding: 20px; line-height: 1.6;">
                                    <p>Hệ thống vừa nhận được một báo cáo vi phạm đối với tin tuyển dụng sau:</p>
                                    <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffebea;">
                                        <p style="margin: 5px 0;"><strong>Tin tuyển dụng:</strong> ${jobTitle}</p>
                                        <p style="margin: 5px 0;"><strong>Công ty:</strong> ${companyName}</p>
                                        <hr style="border: none; border-top: 1px solid #fee2e1; margin: 10px 0;"/>
                                        <p style="margin: 5px 0;"><strong>Người báo cáo:</strong> ${reporterName}</p>
                                        <p style="margin: 5px 0;"><strong>Email:</strong> ${reporterEmail || "N/A"}</p>
                                        <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${reporterPhone}</p>
                                    </div>
                                    <div style="padding: 15px; background: #fafafa; border-radius: 5px; margin-bottom: 20px;">
                                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Nội dung phản ánh:</p>
                                        <div style="color: #666; font-style: italic;">"${content}"</div>
                                    </div>
                                    <div style="text-align: center; margin-top: 30px;">
                                        <a href="${reportLink}" 
                                           style="background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                            Xem và xử lý ngay
                                        </a>
                                    </div>
                                </div>
                                <div style="background-color: #f9f9f9; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                                    <p>Email này được gửi tự động để đảm bảo an toàn cho sàn tuyển dụng GDU.</p>
                                </div>
                            </div>
                        `
                    })
                }
            }
        } catch (err) {
            console.error('Failed to trigger admin notifications for report:', err)
        }

        return NextResponse.json({ success: true, message: 'Gửi báo cáo thành công' })
    } catch (error) {
        console.error('Error submitting report:', error)
        return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi khi gửi báo cáo' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { reportId, status, adminResponse, jobAction } = body

        if (!reportId || !status || !adminResponse) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId }
        })

        if (!report) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 })
        }

        const job = await prisma.job.findUnique({
            where: { id: report.jobId }
        })

        // Update report status and response
        await prisma.report.update({
            where: { id: reportId },
            data: {
                status,
                adminResponse,
                jobAction: jobAction || 'none',
                resolvedAt: new Date()
            }
        })

        // Handle Job Actions
        if (job) {
            if (jobAction === 'hide') {
                await prisma.job.update({
                    where: { id: report.jobId },
                    data: { status: 'rejected' }
                })
                // Notify job creator
                if (job.creatorId) {
                    await prisma.notification.create({
                        data: {
                            userId: job.creatorId,
                            type: 'system',
                            title: 'Tin tuyển dụng đã bị gỡ',
                            message: `Tin tuyển dụng "${job.title}" của bạn đã bị gỡ sau khi có báo cáo vi phạm được xác thực. Phản hồi của admin: ${adminResponse}`,
                            link: '/dashboard/my-jobs'
                        }
                    })
                }
            } else if (jobAction === 'delete') {
                await prisma.job.delete({
                    where: { id: report.jobId }
                })
                // Notify job creator
                if (job.creatorId) {
                    await prisma.notification.create({
                        data: {
                            userId: job.creatorId,
                            type: 'system',
                            title: 'Tin tuyển dụng đã bị xóa',
                            message: `Tin tuyển dụng "${job.title}" của bạn đã bị xóa vĩnh viễn sau khi có báo cáo vi phạm nghiêm trọng.`,
                            link: '/dashboard/my-jobs'
                        }
                    })
                }
            }
        }

        // Notify reporter if reporterUserId exists
        if (report.reporterUserId) {
            let message = `Admin đã xử lý báo cáo của bạn về tin "${report.jobTitle}": ${adminResponse}`
            if (jobAction === 'hide') message += " (Tin đã bị gỡ bỏ)."
            if (jobAction === 'delete') message += " (Tin đã được xóa vĩnh viễn)."

            await prisma.notification.create({
                data: {
                    userId: report.reporterUserId,
                    type: 'system',
                    title: status === 'resolved' ? 'Kết quả xử lý báo cáo' : 'Phản hồi báo cáo vi phạm',
                    message,
                    link: jobAction === 'delete' ? undefined : `/jobs/${report.jobId}`
                }
            })
        }

        return NextResponse.json({ success: true, message: 'Xử lý báo cáo thành công' })
    } catch (error) {
        console.error('Error updating report:', error)
        return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi khi xử lý báo cáo' }, { status: 500 })
    }
}

