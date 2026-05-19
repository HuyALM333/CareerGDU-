/**
 * Redesigned email templates for candidate notifications
 * Inspired by TopCV but customized for GDU Career Portal
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://career.giadinh.edu.vn';
//const LOGO_URL = `${APP_URL}/gdu-logo.png`;

interface BaseTemplateProps {
    title: string;
    content: string;
    actionTitle?: string;
    actionDescription?: string;
    primaryColor?: string;
}

const getBaseTemplate = ({
    title,
    content,
    actionTitle,
    actionDescription,
    primaryColor = '#1e3a8a'
}: BaseTemplateProps) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; color: #333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: ${primaryColor}; padding: 30px 20px;">
                            <img src="cid:gdu-logo" alt="GDU Logo" width="120" style="display:block; margin:0 auto 15px; max-width:120px; height:auto;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 600;">GDU CAREER PORTAL</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px; text-align: center; font-weight: 700;">${title}</h2>
                            <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                                ${content}
                            </div>
                            
                            ${actionTitle ? `
                            <div style="margin-top: 35px; padding: 25px; background-color: #f8fafc; border-left: 5px solid ${primaryColor}; border-radius: 8px;">
                                <h3 style="margin: 0 0 12px; color: ${primaryColor}; font-size: 18px; font-weight: 700;">${actionTitle}</h3>
                                <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">${actionDescription}</p>
                            </div>
                            ` : ''}

                            <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 30px;">
                                <p style="margin: 30px 0 0; font-size: 15px;">
                                    Trân trọng,<br>
                                    <strong style="color: #111827;">Đội ngũ GDU Career</strong>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 35px 30px; text-align: center; color: #9ca3af; font-size: 13px;">
                            <div style="margin-bottom: 20px;">
                                <a href="${APP_URL}" style="color: #ffffff; text-decoration: none; font-weight: 600; margin: 0 10px;">Trang chủ</a> | 
                                <a href="${APP_URL}/jobs" style="color: #ffffff; text-decoration: none; font-weight: 600; margin: 0 10px;">Việc làm</a> | 
                                <a href="${APP_URL}/dashboard" style="color: #ffffff; text-decoration: none; font-weight: 600; margin: 0 10px;">Cá nhân</a>
                            </div>
                            <p style="margin: 0 0 10px;">Địa chỉ: 185 - 187 Hoàng Văn Thụ, Phường 8, Quận Phú Nhuận, TP. HCM</p>
                            <p style="margin: 0 0 10px;">Hotline: (028) 7301 3456 | Email: career@giadinh.edu.vn</p>
                            <p style="margin: 20px 0 0; color: #6b7280;">&copy; 2026 Gia Dinh University Career Portal. All rights reserved.</p>
                            <div style="margin-top: 20px; font-size: 11px; color: #4b5563;">
                                Đây là email tự động, vui lòng không trả lời trực tiếp vào email này.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const getInterviewEmailTemplate = (candidateName: string, jobTitle: string) => {
    return getBaseTemplate({
        title: 'Thông báo kết quả tuyển dụng',
        content: `
            <p>Xin chào <strong style="color: #ef4444;">${candidateName}</strong>,</p>
            <p>Cảm ơn bạn đã dành thời gian quan tâm và nộp hồ sơ vào vị trí <strong style="color: #111827;">${jobTitle}</strong> tại hệ thống GDU Career.</p>
            <p>Chúng tôi rất ấn tượng với hồ sơ của bạn và vui mừng thông báo rằng CV của bạn đã đạt yêu cầu sơ tuyển. Chúng tôi muốn mời bạn tham gia buổi phỏng vấn để trao đổi chi tiết hơn về công việc.</p>
        `,
        actionTitle: 'Hành động tiếp theo:',
        actionDescription: 'Nhà tuyển dụng sẽ trực tiếp liên hệ với bạn qua số điện thoại hoặc email cá nhân trong vòng 24-48h tới để sắp xếp lịch phỏng vấn cụ thể. Bạn hãy chú ý điện thoại nhé!'
    });
};

export const getRejectedEmailTemplate = (candidateName: string, jobTitle: string) => {
    return getBaseTemplate({
        title: 'Thông báo kết quả kết quả ứng tuyển',
        primaryColor: '#4b5563', // Gray for rejection
        content: `
            <p>Xin chào <strong style="color: #111827;">${candidateName}</strong>,</p>
            <p>Cảm ơn bạn đã nộp hồ sơ ứng tuyển vị trí <strong style="color: #111827;">${jobTitle}</strong> tại GDU Career Portal.</p>
            <p>Rất tiếc, sau khi xem xét kỹ lưỡng hồ sơ, chúng tôi nhận thấy kinh nghiệm và kỹ năng của bạn chưa thực sự phù hợp với yêu cầu hiện tại của vị trí này. Chúng tôi sẽ lưu thông tin của bạn vào nguồn dữ liệu ứng viên để liên hệ cho các vị trí phù hợp trong tương lai.</p>
            <p>Chúc bạn sớm tìm được cơ hội nghề nghiệp ưng ý và gặt hái nhiều thành công.</p>
        `
    });
};

export const getHiredEmailTemplate = (candidateName: string, jobTitle: string) => {
    return getBaseTemplate({
        title: 'CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN!',
        primaryColor: '#059669', // Green for success
        content: `
            <p>Xin chào <strong style="color: #ef4444;">${candidateName}</strong>,</p>
            <p>Chúng tôi vô cùng vui mừng thông báo rằng bạn đã vượt qua các vòng tuyển dụng và chính thức <strong>TRÚNG TUYỂN</strong> vào vị trí <strong style="color: #111827;">${jobTitle}</strong>.</p>
            <p>Đây là niềm tự hào của GDU Career khi được kết nối những ứng viên tài năng như bạn với các doanh nghiệp uy tín. Chúng tôi tin rằng bạn sẽ đóng góp tích cực và phát triển mạnh mẽ tại môi trường làm việc mới.</p>
        `,
        actionTitle: 'Thông tin tiếp nhận:',
        actionDescription: 'Đại diện bộ phận nhân sự của doanh nghiệp sẽ sớm gửi thông báo chi tiết về thời gian nhận việc, các giấy tờ cần chuẩn bị và quy trình onboarding qua email/điện thoại cho bạn.'
    });
};
