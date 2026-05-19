import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { VisitorTracker } from "@/components/visitor-tracker"
import { Toaster } from "@/components/ui/toaster"
import { AdminQuickActions } from "@/components/admin/admin-quick-actions"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: "GDU Career - Cổng việc làm sinh viên Đại học Gia Định",
  description: "Kết nối sinh viên GDU với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <VisitorTracker />
          {children}
          <AdminQuickActions />
          <SocialChatWidget />
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

