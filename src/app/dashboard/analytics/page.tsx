"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, Briefcase, Eye, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

interface AnalyticsData {
  summary: {
    totalVisitors: number
    visitorsThisMonth: number
    visitorsChange: number
    newStudents: number
    studentsChange: number
    newJobs: number
    jobsChange: number
    applicationRate: number
    rateChange: number
    totalApplications: number
  }
  trafficData: Array<{ name: string; visitors: number; pageViews: number }>
  userGrowthData: Array<{ name: string; students: number; employers: number }>
  jobCategoryData: Array<{ name: string; jobs: number; applications: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics")
        const result = await res.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || "Không thể tải dữ liệu thống kê")
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error || "Không có dữ liệu"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const { summary, trafficData, userGrowthData, jobCategoryData } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Thống kê hệ thống</h1>
        <p className="text-muted-foreground mt-1">Theo dõi hiệu suất và tăng trưởng của nền tảng</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt truy cập</p>
                <p className="text-2xl font-bold">{summary.totalVisitors.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${summary.visitorsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.visitorsChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{summary.visitorsChange >= 0 ? '+' : ''}{summary.visitorsChange}% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sinh viên mới</p>
                <p className="text-2xl font-bold">{summary.newStudents.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${summary.studentsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.studentsChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{summary.studentsChange >= 0 ? '+' : ''}{summary.studentsChange}% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Việc làm đăng mới</p>
                <p className="text-2xl font-bold">{summary.newJobs.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${summary.jobsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.jobsChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{summary.jobsChange >= 0 ? '+' : ''}{summary.jobsChange}% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ ứng tuyển</p>
                <p className="text-2xl font-bold">{summary.applicationRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${summary.rateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.rateChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{summary.rateChange >= 0 ? '+' : ''}{summary.rateChange}% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lưu lượng truy cập</CardTitle>
            <CardDescription>Số lượt truy cập và xem trang theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {trafficData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="Lượt xem trang"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stackId="2"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.2}
                      name="Lượt truy cập"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có dữ liệu lưu lượng truy cập
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
            <CardDescription>Số lượng sinh viên và nhà tuyển dụng theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Sinh viên"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="employers"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Nhà tuyển dụng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có dữ liệu người dùng
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Việc làm theo ngành nghề</CardTitle>
          <CardDescription>Phân bố việc làm và ứng tuyển theo ngành</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {jobCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Việc làm" />
                  <Bar dataKey="applications" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} name="Ứng tuyển" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chưa có dữ liệu việc làm theo ngành
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
