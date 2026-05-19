"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, GraduationCap, Mail, Phone, ExternalLink } from "lucide-react"

export default function CandidatesPage() {
    const { user } = useAuth()
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        try {
            setLoading(true)
            // Re-using the /api/users endpoint but we might need to filter for students
            // Ideally API should support ?role=student
            // Let's assume /api/users returns all for now and we filter here, 
            // or we update API to better support this.
            // Since I have admin access to /api/users but this is employer, 
            // I need to ensure employers can access this list.
            // The current /api/users might be restricted to admin. I should check api/users/route.ts.

            const res = await fetch('/api/users')
            const data = await res.json()

            if (data.success) {
                // Filter only students
                const students = data.users.filter((u: any) => u.role === 'student')
                setCandidates(students)
            }
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter candidates
    const filteredCandidates = candidates.filter(c => {
        const matchName = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchEmail = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchName || matchEmail
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground">
                        Tìm kiếm ứng viên
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Khám phá tài năng trẻ từ Đại học Gia Định
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email hoặc kỹ năng..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Đang tải danh sách ứng viên...</div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Không tìm thấy ứng viên nào phù hợp.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCandidates.map((student) => (
                                <Card key={student._id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (student.name?.charAt(0) || "U").toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{student.name || "Sinh viên ẩn danh"}</h3>
                                                    <Badge variant="secondary" className="mt-1">Sinh viên</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                <span>Công nghệ thông tin (Ví dụ)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>TP. Hồ Chí Minh</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-2">
                                            <Button className="w-full" variant="outline" size="sm">
                                                Xem hồ sơ
                                            </Button>
                                            <Button className="w-full" size="sm">
                                                Liên hệ
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
