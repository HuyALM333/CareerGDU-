"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { FileText, Calendar, Building } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Application {
  _id: string
  jobId: string

  job?: {
    title?: string
    company?: string
  }

  name: string
  email: string
  phone: string
  coverLetter: string
  cvOriginalName: string
  status: string

  appliedAt: string
}

export default function MyApplicationsPage() {
  const { user, isLoading } = useAuth()
  const { toast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && user) {
      fetchApplications()
    }
  }, [isLoading, user])

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications`)
      const data = await res.json()

      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCV = async (app: Application) => {
    setSelectedApp(app)
    setCvUrl(null)
    setCvLoading(true)

    try {
      const res = await fetch(`/api/applications/${app._id}`)
      const data = await res.json()

      if (data.success && data.data.cvUrl) {
        const fullUrl = `${window.location.origin}${data.data.cvUrl}`

        if (data.data.cvType === "application/pdf") {
          // ✅ Preview PDF
          setCvUrl(fullUrl)
        } else {
          // ✅ Download DOC/DOCX với tên đẹp
          const link = document.createElement("a")
          link.href = fullUrl
          link.download = data.data.cvOriginalName || "CV"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // 👉 đóng modal luôn cho gọn UX
          setSelectedApp(null)
        }
      } else {
        throw new Error("No CV")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải CV",
        variant: "destructive"
      })
    } finally {
      setCvLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-100 text-blue-700">Đã gửi hồ sơ</Badge>
      case "reviewed":
        return <Badge className="bg-yellow-100 text-yellow-700">Đã xem hồ sơ</Badge>
      case "interviewed":
        return <Badge className="bg-purple-100 text-purple-700">Mời phỏng vấn</Badge>
      case "hired":
        return <Badge className="bg-green-100 text-green-700">Đã trúng tuyển</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Chưa phù hợp</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Việc làm đã ứng tuyển</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi trạng thái và kết quả ứng tuyển các vị trí của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn ứng tuyển của bạn ({applications.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Chưa có hồ sơ nào</h3>
              <p className="text-gray-500">Bạn chưa nộp hồ sơ vào vị trí nào.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí & Doanh nghiệp</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Hồ sơ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <div className="font-bold text-[#1e3a5f]">
                        {app.job?.title || "Không rõ vị trí"}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Building className="h-3 w-3" />
                        {app.job?.company || "Không rõ công ty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 p-0"
                        onClick={() => handleViewCV(app)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {app.cvOriginalName || "Xem CV"}
                      </Button>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              CV: {selectedApp?.job?.title || "Không rõ"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 bg-gray-100 rounded-md overflow-hidden relative">
            {cvLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cvUrl ? (
              <iframe src={cvUrl} className="w-full h-full" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Không thể hiển thị CV
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
