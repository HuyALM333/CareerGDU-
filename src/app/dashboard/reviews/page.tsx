"use client"

import { useState, useEffect } from "react"
import { Star, TrendingUp, Calendar, Download, RefreshCw, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Review {
  id: number
  name: string
  avatar: string
  avatarUrl: string
  rating: number
  comment: string
  raw_rating: string
  review_time: string
  verified: boolean
}

interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    "5": number
    "4": number
    "3": number
    "2": number
    "1": number
  }
}

const monthlyData = [
  { name: "T6", reviews: 45, avgRating: 4.2 },
  { name: "T7", reviews: 52, avgRating: 4.3 },
  { name: "T8", reviews: 48, avgRating: 4.1 },
  { name: "T9", reviews: 61, avgRating: 4.4 },
  { name: "T10", reviews: 73, avgRating: 4.5 },
  { name: "T11", reviews: 89, avgRating: 4.6 },
  { name: "T12", reviews: 95, avgRating: 4.7 },
]

export default function ReviewsDashboardPage() {
  const { user } = useAuth()
  const [dateFilter, setDateFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/data/reviews.json')
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/data/reviews-stats.json')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const totalReviews = stats?.total_reviews || reviews.length
  const avgRating = stats?.average_rating || (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0)

  // Calculate rating distribution from stats or reviews
  const ratingDistribution = stats ? [
    { name: "5 sao", value: stats.rating_distribution["5"], color: "#22c55e" },
    { name: "4 sao", value: stats.rating_distribution["4"], color: "#84cc16" },
    { name: "3 sao", value: stats.rating_distribution["3"], color: "#eab308" },
    { name: "2 sao", value: stats.rating_distribution["2"], color: "#f97316" },
    { name: "1 sao", value: stats.rating_distribution["1"], color: "#ef4444" },
  ] : [
    { name: "5 sao", value: reviews.filter(r => r.rating === 5).length, color: "#22c55e" },
    { name: "4 sao", value: reviews.filter(r => r.rating === 4).length, color: "#84cc16" },
    { name: "3 sao", value: reviews.filter(r => r.rating === 3).length, color: "#eab308" },
    { name: "2 sao", value: reviews.filter(r => r.rating === 2).length, color: "#f97316" },
    { name: "1 sao", value: reviews.filter(r => r.rating === 1).length, color: "#ef4444" },
  ]

  // Filter reviews by rating
  const filteredReviews = reviews.filter(review => {
    if (ratingFilter === "all") return true
    return review.rating === parseInt(ratingFilter)
  })

  // Calculate 5-star percentage
  const fiveStarCount = ratingDistribution.find(r => r.name === "5 sao")?.value || 0
  const fiveStarPercentage = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const handleExportCSV = () => {
    if (reviews.length === 0) return

    // Add BOM for Excel correct display of UTF-8
    const BOM = "\uFEFF"
    const headers = ["ID", "Tên", "Đánh giá (Sao)", "Nội dung", "Thời gian", "Xác thực"]
    const csvContent = BOM + [
      headers.join(","),
      ...reviews.map(r => [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.rating,
        `"${(r.comment || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${r.review_time}"`,
        r.verified ? "Có" : "Không"
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `gdu_reviews_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Đánh giá Google Maps</h1>
          <p className="text-muted-foreground mt-1">Thống kê và phân tích đánh giá về GDU trên Google Maps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Cập nhật
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                <p className="text-3xl font-bold">{totalReviews}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                <p className="text-3xl font-bold">{avgRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
            <div className="mt-2">{renderStars(Math.round(avgRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang hiển thị</p>
                <p className="text-3xl font-bold">{filteredReviews.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">đánh giá</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">5 sao</p>
                <p className="text-3xl font-bold">{fiveStarPercentage}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${fiveStarPercentage}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng đánh giá theo tháng</CardTitle>
            <CardDescription>Số lượng đánh giá và điểm trung bình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="reviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRating"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố đánh giá</CardTitle>
            <CardDescription>Tỷ lệ các mức đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {ratingDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Đánh giá gần đây</CardTitle>
              <CardDescription>Danh sách các đánh giá mới nhất từ Google Maps</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.slice(0, 10).map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {review.avatarUrl ? (
                        <img
                          src={review.avatarUrl}
                          alt={review.name}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium flex-shrink-0 ${review.avatarUrl ? 'hidden' : ''}`}>
                        {review.avatar || review.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{review.name}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{review.review_time}</p>
                        <p className="mt-2 text-foreground">{review.comment || <span className="italic text-muted-foreground">Không có nội dung đánh giá</span>}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        review.rating >= 4
                          ? "bg-green-100 text-green-800"
                          : review.rating === 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {review.rating} sao
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredReviews.length > 10 && (
                <p className="text-center text-muted-foreground text-sm">
                  Hiển thị 10/{filteredReviews.length} đánh giá. Lọc theo số sao để xem thêm.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
