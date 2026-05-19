"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboardContent } from "@/components/dashboard/admin-content"
import { StudentDashboardContent } from "@/components/dashboard/student-content"
import { EmployerDashboardContent } from "@/components/dashboard/employer-content"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1">
            {user?.role === "admin"
              ? "Quản lý hệ thống GDU Career Portal"
              : "Theo dõi tiến trình và tìm kiếm cơ hội mới"}
          </p>
        </div>
      </div>

      {user?.role === "admin" ? (
        <AdminDashboardContent />
      ) : user?.role === "employer" ? (
        <EmployerDashboardContent />
      ) : (
        <StudentDashboardContent />
      )}
    </div>
  )
}
