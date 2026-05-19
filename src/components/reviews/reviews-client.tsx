"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, MessageSquare, Calendar, TrendingUp, AlertCircle, CheckCircle, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ReviewsDataManager } from "./reviews-data-manager"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface Review {
  id: string
  author: string
  avatar: string
  avatarUrl?: string
  avatarColor?: string
  major: string
  year: string
  rating: number
  category: string
  title: string
  content: string
  likes: number
  comments: number
  date: string
  review_time?: string
  helpful: boolean
  userId?: string
}

export function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [submitting, setSubmitting] = useState(false)
  const [dataSource, setDataSource] = useState<string>("none")
  // Initialize dataProcessed from sessionStorage to persist across navigation
  const [dataProcessed, setDataProcessed] = useState(false)
  const [stats, setStats] = useState<any>(null)
  // Pagination: Initially show 20 reviews, then load 10 more each time
  const [visibleCount, setVisibleCount] = useState(20)
  const { toast } = useToast()
  const [newReview, setNewReview] = useState({
    rating: 5,
    category: "Chương trình đào tạo",
    title: "",
    content: "",
  })

  // Like toggle state - tracks which reviews this user has liked
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set())

  // Comment state
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Array<{ id: string, text: string, date: string, author: string, userId?: string, email?: string, avatarUrl?: string }>>>({})
  const [newCommentText, setNewCommentText] = useState("")

  const { user } = useAuth()

  // Visitor ID for anonymous likes
  const [visitorId, setVisitorId] = useState<string>("")

  // Check sessionStorage on mount to restore dataProcessed state
  useEffect(() => {
    const storedDataProcessed = sessionStorage.getItem("dataProcessed")
    if (storedDataProcessed === "true") {
      setDataProcessed(true)
    }
  }, [])

  // Only fetch reviews when category changes, data has been processed, or user/visitorId changes
  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [selectedCategory, user?.id, visitorId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "Tất cả") {
        params.append("category", selectedCategory)
      }

      // Pass user info to check for likes
      if (user?.id) {
        params.append("userId", user.id)
      } else if (visitorId) {
        params.append("visitorId", visitorId)
      }

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews)
        setDataSource(data.source || "none")

        // Update liked reviews from backend
        if (data.likedReviewIds && Array.isArray(data.likedReviewIds)) {
          setLikedReviews(new Set(data.likedReviewIds))
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch reviews:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
      console.error("[v0] Failed to fetch stats:", error)
    }
  }

  // Handler for when data is processed - saves to sessionStorage and sets state
  const handleDataProcessed = () => {
    sessionStorage.setItem("dataProcessed", "true")
    setDataProcessed(true)
  }

  const handleSubmitReview = async () => {
    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung đánh giá.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReview,
          author: user?.name || "Người dùng ẩn danh",
          userId: user?.id,
          avatar: user?.avatar,
          email: user?.email,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "Thành công!",
          description: "Đánh giá của bạn đã được gửi thành công.",
        })
        setShowForm(false)
        setNewReview({ rating: 5, category: "Chương trình đào tạo", title: "", content: "" })
        fetchReviews()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Failed to submit review:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    let storedVisitorId = localStorage.getItem("visitorId")
    if (!storedVisitorId) {
      storedVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem("visitorId", storedVisitorId)
    }
    setVisitorId(storedVisitorId)
  }, [])

  const handleLike = async (reviewId: string) => {
    // Use user ID if logged in, otherwise use visitor ID
    const userId = user?.id || visitorId
    if (!userId) return

    try {
      const response = await fetch("/api/reviews/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, visitorId: userId }),
      })
      const data = await response.json()

      if (data.success) {
        // Update liked state
        setLikedReviews((prev) => {
          const newSet = new Set(prev)
          if (data.liked) {
            newSet.add(reviewId)
          } else {
            newSet.delete(reviewId)
          }
          return newSet
        })

        // Update like count in reviews
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, likes: data.totalLikes }
              : review
          )
        )

        toast({
          title: data.liked ? "Đã thích!" : "Đã bỏ thích",
          description: data.liked ? "Cảm ơn bạn đã đánh giá hữu ích." : "Bạn đã bỏ đánh giá hữu ích.",
        })
      }
    } catch (error) {
      console.error("[v0] Error toggling like:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleToggleComments = async (reviewId: string) => {
    if (expandedComments === reviewId) {
      setExpandedComments(null)
      setNewCommentText("")
      return
    }

    setExpandedComments(reviewId)
    setNewCommentText("")

    // Fetch comments from API if not already loaded
    if (!comments[reviewId]) {
      try {
        const response = await fetch(`/api/reviews/comments?reviewId=${reviewId}`)
        const data = await response.json()
        if (data.success) {
          setComments((prev) => ({
            ...prev,
            [reviewId]: data.comments
          }))
        }
      } catch (error) {
        console.error("[v0] Error fetching comments:", error)
      }
    }
  }

  const handleAddComment = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để bình luận.",
        variant: "destructive",
      })
      // Optional: Redirect to login or show login modal
      return
    }

    if (!newCommentText.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bình luận.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/reviews/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          author: user.name || "Người dùng", // Use logged in user's name
          userId: user.id,
          email: user.email,
          avatar: user.avatar,
          text: newCommentText.trim()
        }),
      })
      const data = await response.json()

      if (data.success) {
        // Add new comment to state
        setComments((prev) => ({
          ...prev,
          [reviewId]: [...(prev[reviewId] || []), data.comment]
        }))

        setNewCommentText("")
        toast({
          title: "Thành công!",
          description: "Bình luận của bạn đã được gửi.",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (reviewId: string, commentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return

    try {
      const response = await fetch(`/api/reviews/comments?id=${commentId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        // Remove comment from state
        setComments((prev) => ({
          ...prev,
          [reviewId]: prev[reviewId]?.filter((c) => c.id !== commentId) || []
        }))

        toast({
          title: "Đã xóa",
          description: "Bình luận đã được xóa.",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bình luận. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.")) return

    if (!user) return

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}&userId=${user.id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
        toast({ title: "Đã xóa", description: "Đánh giá của bạn đã được xóa." })
      } else {
        toast({ title: "Lỗi", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Delete review error:", error)
      toast({ title: "Lỗi", description: "Không thể xóa đánh giá.", variant: "destructive" })
    }
  }

  const categories = [
    "Tất cả",
    "Chương trình đào tạo",
    "Cơ sở vật chất",
    "Giảng viên",
    "Hoạt động sinh viên",
    "Hỗ trợ việc làm",
    "Khác",
  ]

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
              } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
    )
  }

  const satisfactionRate =
    stats && stats.total_reviews > 0
      ? Math.round(
        (((stats.rating_distribution?.["5"] || 0) + (stats.rating_distribution?.["4"] || 0)) / stats.total_reviews) *
        100,
      )
      : null



  return (
    <div className="space-y-6">
      <ReviewsDataManager onDataProcessed={handleDataProcessed} />

      {dataSource === "json" && reviews.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Đang hiển thị dữ liệu từ Google Maps</h3>
                <p className="text-sm text-muted-foreground">{reviews.length} đánh giá đã được tải từ file JSON</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">
              Google Maps
            </Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {stats?.google_maps_rating ? stats.google_maps_rating.toFixed(1) : stats?.average_rating ? stats.average_rating.toFixed(1) : "-"}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats?.google_maps_rating ? "Google Maps" : "Đánh giá TB"}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {stats?.total_reviews_on_maps || stats?.total_reviews || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats?.total_reviews_on_maps ? "Tổng trên Maps" : "Đánh giá"}
              </div>
              {stats?.total_reviews_on_maps && stats?.total_reviews && (
                <div className="text-xs text-muted-foreground">
                  ({stats.total_reviews} đã crawl)
                </div>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {satisfactionRate !== null ? `${satisfactionRate}%` : "-"}
              </div>
              <div className="text-sm text-muted-foreground">Hài lòng</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats?.verified_count || 0}</div>
              <div className="text-sm text-muted-foreground">Xác thực</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-accent to-accent/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-1">Chia sẻ trải nghiệm của bạn</h3>
            <p className="text-muted-foreground">Giúp các bạn sinh viên khác có thêm thông tin hữu ích</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-secondary hover:bg-secondary/90 shrink-0">
            {showForm ? "Đóng" : "Viết đánh giá"}
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="p-6 bg-card shadow-lg">
          <h3 className="font-bold text-xl mb-4 text-foreground">Đánh giá mới</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Đánh giá</label>
              {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Danh mục</label>
              <select
                value={newReview.category}
                onChange={(e) => setNewReview({ ...newReview, category: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Tiêu đề</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="Nhập tiêu đề đánh giá..."
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Nội dung</label>
              <Textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows={5}
                className="bg-background"
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => {
              setSelectedCategory(category)
              setVisibleCount(20) // Reset pagination when changing category
            }}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className={selectedCategory === category ? "bg-primary" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center bg-card">
          <p className="text-muted-foreground">Chưa có đánh giá nào trong danh mục này</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, visibleCount).map((review) => (
            <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14 shrink-0 text-lg font-semibold">
                  {review.avatarUrl && (
                    <AvatarImage src={review.avatarUrl} alt={review.author} referrerPolicy="no-referrer" />
                  )}
                  <AvatarFallback
                    className={`bg-gradient-to-br ${review.avatarColor || "from-primary to-primary/70"} text-white`}
                  >
                    {review.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-foreground">{review.author}</h4>
                        {review.helpful && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Xác thực
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.major} - {review.year} • {review.review_time || review.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold text-foreground ml-1">{review.rating}.0</span>
                        {user && review.userId === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                            onClick={() => handleDeleteReview(review.id)}
                            title="Xóa đánh giá này"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {review.category}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-semibold text-base mb-2 text-foreground">{review.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">{review.content}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {/* Date moved to top */}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto py-1 ${likedReviews.has(review.id) ? "text-primary" : "hover:text-primary"}`}
                        onClick={() => handleLike(review.id)}
                      >
                        <ThumbsUp className={`h-4 w-4 mr-1.5 ${likedReviews.has(review.id) ? "fill-primary" : ""}`} />
                        <span>{likedReviews.has(review.id) ? "Đã thích" : "Hữu ích"} ({review.likes})</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto py-1 ${expandedComments === review.id ? "text-primary" : "hover:text-primary"}`}
                        onClick={() => handleToggleComments(review.id)}
                      >
                        <MessageSquare className={`h-4 w-4 mr-1.5 ${expandedComments === review.id ? "fill-primary" : ""}`} />
                        <span>Bình luận ({comments[review.id] ? comments[review.id].length : review.comments})</span>
                      </Button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  {expandedComments === review.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Existing Comments */}
                      {comments[review.id]?.length > 0 && (
                        <div className="space-y-3">
                          {comments[review.id].map((comment, idx) => (
                            <div key={comment.id || idx} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    {comment.avatarUrl && <AvatarImage src={comment.avatarUrl} alt={comment.author} referrerPolicy="no-referrer" />}
                                    <AvatarFallback className="text-[10px]">{comment.author?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm text-foreground">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">• {comment.date}</span>
                                </div>

                                {user && (comment.userId === user.id || (comment.email && comment.email === user.email)) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                                    onClick={() => handleDeleteComment(review.id, comment.id)}
                                    title={`Xóa bình luận của bạn (ID: ${comment.id})`}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-semibold">Xóa</span>
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Form */}
                      <div className="flex gap-2">
                        {user ? (
                          <>
                            <Textarea
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder={`Bình luận với tên ${user.name}...`}
                              rows={2}
                              className="flex-1 bg-background text-sm resize-none"
                            />
                            <Button
                              size="sm"
                              className="self-end"
                              onClick={() => handleAddComment(review.id)}
                            >
                              Gửi
                            </Button>
                          </>
                        ) : (
                          <div className="w-full p-4 bg-muted/30 rounded-lg text-center border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground mb-2">Vui lòng đăng nhập để bình luận</p>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/login">Đăng nhập ngay</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Load More Button */}
          {visibleCount < reviews.length && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="px-8 bg-card hover:bg-accent"
              >
                Xem thêm ({reviews.length - visibleCount} đánh giá còn lại)
              </Button>
            </div>
          )}
        </div>
      )
      }
    </div >
  )
}
