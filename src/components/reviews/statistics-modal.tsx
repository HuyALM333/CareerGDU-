"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Star, TrendingUp, Users, Award, BarChart3 } from "lucide-react"

interface StatisticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: any
}

export function StatisticsModal({ open, onOpenChange, stats }: StatisticsModalProps) {
  if (!stats) return null

  const satisfactionRate =
    stats.total_reviews > 0
      ? Math.round(((stats.rating_distribution["5"] + stats.rating_distribution["4"]) / stats.total_reviews) * 100)
      : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Thống kê đánh giá chi tiết
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-star/10 to-yellow-500/5">
              <div className="flex flex-col items-center text-center">
                <Star className="h-8 w-8 text-yellow-500 mb-2 fill-yellow-500" />
                <div className="text-3xl font-bold text-foreground">
                  {stats.average_rating ? stats.average_rating.toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-muted-foreground">Đánh giá trung bình</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-3xl font-bold text-foreground">{stats.total_reviews}</div>
                <div className="text-sm text-muted-foreground">Tổng đánh giá</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-3xl font-bold text-foreground">{satisfactionRate}%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ hài lòng</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <div className="flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-3xl font-bold text-foreground">{stats.verified_count}</div>
                <div className="text-sm text-muted-foreground">Đã xác thực</div>
              </div>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 text-foreground">Phân bố đánh giá</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution?.[rating] || 0
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Department Statistics */}
          {stats.department_stats && Object.keys(stats.department_stats).length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-foreground">Thống kê theo khoa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.department_stats).map(([dept, deptStats]: [string, any]) => (
                  <Card key={dept} className="p-4 bg-accent/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{dept}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{deptStats.average_rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {deptStats.count || 0} đánh giá
                      {deptStats.verified && ` • ${deptStats.verified} xác thực`}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Additional Insights */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="font-bold text-lg mb-3 text-foreground">Thông tin chi tiết</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Đánh giá cao nhất</div>
                <div className="font-bold text-lg text-foreground">{stats.rating_distribution?.["5"] || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Đánh giá thấp nhất</div>
                <div className="font-bold text-lg text-foreground">{stats.rating_distribution?.["1"] || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tỷ lệ xác thực</div>
                <div className="font-bold text-lg text-foreground">
                  {stats.total_reviews > 0 ? Math.round((stats.verified_count / stats.total_reviews) * 100) : 0}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
