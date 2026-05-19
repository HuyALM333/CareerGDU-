"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw, CheckCircle, AlertCircle, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StatisticsModal } from "./statistics-modal"

interface ReviewsDataManagerProps {
  onDataProcessed?: () => void
}

export function ReviewsDataManager({ onDataProcessed }: ReviewsDataManagerProps) {
  const [processing, setProcessing] = useState(false)
  const [lastProcessed, setLastProcessed] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const { toast } = useToast()

  const processJSONData = async () => {
    setProcessing(true)
    try {
      // Call API to process JSON data via Python script
      const response = await fetch("/api/reviews/process-json", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thành công!",
          description: `Đã xử lý ${data.stats?.total_reviews || 0} đánh giá từ Google Maps.`,
        })
        setLastProcessed(new Date().toLocaleString("vi-VN"))
        setStats(data.stats)
        if (onDataProcessed) {
          onDataProcessed()
        }
      } else {
        throw new Error(data.error || "Không thể xử lý dữ liệu")
      }
    } catch (error: any) {
      console.error("[v0] JSON processing error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xử lý dữ liệu. Vui lòng kiểm tra file JSON và Python script.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reviews/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[v0] Stats fetch error:", error)
    }
  }

  const handleViewStats = async () => {
    await fetchStats()
    setShowStatsModal(true)
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Xử lý dữ liệu JSON (Python)</h3>
              <p className="text-sm text-muted-foreground">Chạy script Python để xử lý dữ liệu Google Maps</p>
            </div>
          </div>
          <Badge variant={lastProcessed ? "default" : "secondary"} className="gap-1">
            {lastProcessed ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Đã kết nối
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Chưa xử lý
              </>
            )}
          </Badge>
        </div>

        {stats && stats.total_reviews > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total_reviews}</div>
              <div className="text-xs text-muted-foreground">Đánh giá</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.average_rating ? stats.average_rating.toFixed(1) : "0.0"}
              </div>
              <div className="text-xs text-muted-foreground">Trung bình</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verified_count}</div>
              <div className="text-xs text-muted-foreground">Xác thực</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_reviews_on_maps || stats.total_reviews}</div>
              <div className="text-xs text-muted-foreground">Trên Maps</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={processJSONData} disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {processing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Xử lý dữ liệu (Python)
              </>
            )}
          </Button>
          <Button onClick={handleViewStats} className="flex-1 bg-gradient-to-r from-primary to-secondary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Xem thống kê
          </Button>
        </div>

        {lastProcessed && (
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground">
              Lần cập nhật cuối: <span className="font-medium text-foreground">{lastProcessed}</span>
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            <strong>File dữ liệu:</strong>{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">data/map_reviews_full.json</code>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Format:</strong> place (name, total_reviews_on_maps, reviews_crawled) + reviews (author, rating, content, avatar, review_time)
          </p>
        </div>
      </Card>

      <StatisticsModal open={showStatsModal} onOpenChange={setShowStatsModal} stats={stats} />
    </>
  )
}
