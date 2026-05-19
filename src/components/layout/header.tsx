"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, Search, User, ChevronDown, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Việc làm", href: "/jobs" },
    { name: "Doanh nghiệp", href: "/companies" },
    { name: "Tin tức", href: "/news" },
    { name: "Liên hệ", href: "/contact" },
  ]

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-primary shadow-md border-b border-gray-100">
      {/* Main header */}
      <div className="w-full px-4 md:px-10 lg:px-20">
        <div className="flex items-center justify-between h-28 lg:h-32 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-4 flex-shrink-0">
            <img
              src="/gdu-logo.png"
              alt="Gia Dinh University"
              className="h-16 lg:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-3 transition-colors font-semibold text-lg border-b-2 ${isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-gray-800 hover:text-primary hover:bg-primary/10"
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-6 w-6" />
            </Button>

            {user ? (
              <>
                {user.role === 'employer' && (
                  <Link href="/dashboard/jobs/new" className="hidden lg:block ml-2">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-11 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98]">
                      <PlusCircle className="w-5 h-5" />
                      <span>Đăng tuyển ngay</span>
                    </Button>
                  </Link>
                )}
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 pr-2 pl-2 h-12">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <span className="hidden md:inline font-bold text-sm">{user.name}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="w-full">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login">
                  <Button
                    variant="secondary"
                    className="bg-gray-100 hover:bg-gray-200 text-primary px-2 sm:px-4 font-semibold text-sm sm:text-base h-9 sm:h-10 border border-gray-200/50"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm sm:text-base px-3 sm:px-6 h-9 sm:h-10">Đăng ký</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-2xl mx-auto">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tìm việc làm, công ty, vị trí..."
                className="bg-transparent border-none text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-white">
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-xl animate-in slide-in-from-top duration-200 overflow-hidden">
          <nav className="container mx-auto px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors font-bold text-gray-800 hover:text-primary active:scale-[0.98]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {!user && (
              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-gray-100">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary text-primary font-bold py-6 rounded-xl">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                {user.role === 'employer' && (
                  <Link
                    href="/dashboard/jobs/new"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/10 mb-3 active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="w-6 h-6" />
                    <span>Đăng tuyển dụng ngay</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-xl bg-primary/5 font-bold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
