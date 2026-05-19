// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// interface SendEmailParams {
//   to: string;
//   subject: string;
//   html: string;
// }

// export async function sendEmail({ to, subject, html }: SendEmailParams) {
//   if (!process.env.RESEND_API_KEY) {
//     console.error("Missing RESEND_API_KEY environment variable");
//     return { success: false, error: "Server configuration error" };
//   }

//   try {
//     const result = await resend.emails.send({
//       from: process.env.MAIL_FROM!,
//       to,
//       subject,
//       html,
//     });

//     return { success: true, data: result };
//   } catch (error) {
//     console.error("Send email error:", error);
//     return { success: false, error };
//   }
// }

import nodemailer from "nodemailer"
import path from "path"

interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: 465, // Using SSL port for reliable connection
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        })

        await transporter.verify()

        const result = await transporter.sendMail({
            from: `"GDU Career Portal" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            attachments: [
                {
                    filename: "gdu-logo.jpg",
                    path: path.join(process.cwd(), "public", "gdu-logo.jpg"),
                    cid: "gdu-logo"
                }
            ]
        })

        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error("Error sending email:", error)
        return { success: false, error }
    }
}
