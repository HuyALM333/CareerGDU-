"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Mail, MapPin, MessageCircle, Phone, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/site-configs?key=site_footer")
        const result = await res.json()
        if (result.success && result.data) {
          setConfig(result.data)
        }
      } catch (error) {
        console.error("Error fetching footer config:", error)
      }
    }
    fetchConfig()
  }, [])

  const defaultFooter = {
    brandDescription: "Cổng thông tin việc làm chính thức dành cho sinh viên Đại học Gia Định. Kết nối nhân tài trẻ với cộng đồng doanh nghiệp uy tín, kiến tạo tương lai vững chắc.",
    centerName: "Trung tâm Trải nghiệm & Việc làm",
    address: "371 Nguyễn Kiệm, Phường Hạnh Thông, Tp. Hồ Chí Minh",
    email: "Studentcentre@giadinh.edu.vn",
    facebook: "https://www.facebook.com/GDUStudentCenter",
    supportTitle: "Bạn cần hỗ trợ trực tiếp?",
    supportDescription: "Đội ngũ tư vấn viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn."
  }

  const footer = config || defaultFooter

  return (
    <footer className="bg-[#0f172a] text-slate-300 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="block">
              <div className="flex items-center gap-3">
                <img
                  src="/gdu-footer-logo.png"
                  alt="Gia Dinh University"
                  className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {footer.brandDescription}
            </p>

          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Quick Links */}
          <div className="lg:col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
              Khám phá
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/jobs">Tìm việc làm</FooterLink>
              <FooterLink href="/companies">Doanh nghiệp</FooterLink>

              <FooterLink href="/about">Về chúng tôi</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-5 md:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-purple-500 rounded-full" />
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-blue-500/20 transition-colors mt-0.5">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-sm">
                  <span className="block text-white mb-1 font-medium">{footer.centerName}</span>
                  <span className="text-slate-400">{footer.address}</span>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <a href={`mailto:${footer.email}`} className="text-sm hover:text-white transition-colors">
                  {footer.email}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-blue-600/20 transition-colors text-blue-400">
                  <Facebook className="h-5 w-5" />
                </div>
                <a
                  href={footer.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Facebook: GDU Student Center
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Action Banner */}
        <div className="mt-12 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50">
          <div className="bg-[#0f172a] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-xl font-bold text-white mb-2">{footer.supportTitle}</h3>
              <p className="text-slate-400 text-sm">{footer.supportDescription}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 z-10">
              <a
                href="https://m.me/GDUStudentCenter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1877F2] hover:bg-[#1864c9] text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messenger</span>
              </a>
              <a
                href="https://zalo.me/0796079423"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0068FF] hover:bg-[#0054cc] text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 text-sm"
              >
                <span className="font-bold text-xs border border-white/40 rounded px-0.5">Z</span>
                <span>Chat Zalo</span>
              </a>
              <a
                href={`mailto:${footer.email}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Gửi Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Gia Dinh University. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Điều khoản sử dụng</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialButton({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all duration-300 ${color} hover:text-white hover:scale-110 hover:-translate-y-1 shadow-sm`}
      aria-label={label}
      title={label}
    >
      {icon}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white group transition-colors">
        <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-blue-500" />
        <span className="group-hover:translate-x-1 transition-transform duration-300">{children}</span>
      </Link>
    </li>
  )
}
