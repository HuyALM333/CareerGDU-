"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Home, Briefcase, User, Settings, Bell, LogOut, FileText, Users, Building, BarChart3, Star, Eye, MessageSquare, ChevronLeft, Flag, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const router = useRouter()

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

  const navigation = user?.role === "admin" ? adminNav : user?.role === "employer" ? employerNav : studentNav

  const handleBack = () => {
    if (pathname === "/dashboard") {
      router.push("/")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 text-gray-900">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-900 hover:bg-gray-100 -ml-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="font-bold text-lg">Gia Dinh University</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-900 hover:bg-gray-100"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-sidebar text-sidebar-foreground shadow-lg overflow-y-auto">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-sidebar-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent -ml-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="font-bold text-lg">Gia Dinh University</span>
            </div>

            <div className="px-4 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
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

            <div className="px-2 py-4 border-t border-sidebar-border">
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
