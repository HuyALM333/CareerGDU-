"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  User,
  Settings,
  FileText,
  Bell,
  Star,
  Users,
  BarChart3,
  Building,
  LogOut,
  MessageSquare,
  Facebook,
  MessageCircle,
  ArrowLeft,
  Eye,
  Flag,
  Newspaper,
  Image as ImageIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const studentNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Việc làm đã lưu", href: "/dashboard/saved-jobs", icon: Briefcase },
  { name: "Đơn ứng tuyển", href: "/dashboard/applications", icon: FileText },
  { name: "Hồ sơ cá nhân", href: "/dashboard/profile", icon: User },
  { name: "Thông báo", href: "/dashboard/notifications", icon: Bell },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

const employerNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Đăng tin tuyển dụng", href: "/dashboard/jobs/new", icon: Briefcase },
  { name: "Quản lý tin đăng", href: "/dashboard/my-jobs", icon: FileText },
  { name: "Quản lý ứng tuyển", href: "/dashboard/applicants-manager", icon: Users },
  { name: "Doanh nghiệp", href: "/dashboard/company", icon: Building },
  { name: "Thông báo", href: "/dashboard/notifications", icon: Bell },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

const adminNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Thống kê", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Quản lý người dùng", href: "/dashboard/users", icon: Users },
  { name: "Quản lý tin đăng", href: "/dashboard/my-jobs", icon: FileText },
  { name: "Quản lý việc làm", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Quản lý tin tức", href: "/dashboard/admin/news", icon: Newspaper },
  { name: "Quản lý Banner", href: "/dashboard/admin/hero", icon: ImageIcon },
  { name: "Quản lý ứng tuyển", href: "/dashboard/applicants-manager", icon: Users },
  { name: "Quản lý đối tác", href: "/dashboard/admin/partners", icon: Building },
  { name: "Đăng tin tuyển dụng", href: "/dashboard/jobs/new", icon: Briefcase },
  { name: "Khách truy cập", href: "/dashboard/visitors", icon: Eye },
  //{ name: "Đánh giá Google", href: "/dashboard/reviews", icon: Star },
  { name: "Cấu hình Trang chủ", href: "/dashboard/admin/settings", icon: Settings },
  { name: "Liên hệ", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Báo cáo vi phạm", href: "/dashboard/admin/reports", icon: Flag },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = user?.role === "admin" ? adminNav : user?.role === "employer" ? employerNav : studentNav

  const roleLabel =
    user?.role === "admin" ? "Quản trị viên" : user?.role === "employer" ? "Nhà tuyển dụng" : "Sinh viên"

  const profileHref = user?.role === "admin" ? "/dashboard/settings" : user?.role === "employer" ? "/dashboard/company" : "/dashboard/profile"

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col h-full">
        {/* Back to Home */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-full bg-sidebar-accent group-hover:bg-sidebar-primary transition-colors">
              <ArrowLeft className="h-5 w-5 group-hover:text-sidebar-primary-foreground transition-colors" />
            </div>
            <span className="font-bold text-lg">Gia Dinh University</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <Link href={profileHref} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* External Links - Hide for Admin */}
        {user?.role !== "admin" && (
          <div className="px-3 pb-2 space-y-1">
            <a
              href="https://www.facebook.com/GDUStudentCenter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-[#1877F2] transition-colors"
              title="Fanpage Đại học Gia Định"
            >
              <Facebook className="h-5 w-5" />
              <span>Facebook Trường</span>
            </a>
            <a
              href="https://zalo.me/0796079423"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-[#0068FF] transition-colors"
              title="Zalo Đại học Gia Định"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Zalo Trường</span>
            </a>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
