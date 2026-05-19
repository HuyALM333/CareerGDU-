import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Job } from "@/lib/jobs-data"
import { Building, MapPin, DollarSign, Clock, CheckCircle2, Award, Briefcase } from "lucide-react"
import Link from "next/link"

import { useAuth } from "@/lib/auth-context"

interface JobPreviewPanelProps {
    job: Job | null
    onApply: (job: Job) => void
    onSave: (job: Job) => void
    isSaved: boolean
}

export function JobPreviewPanel({ job, onApply, onSave, isSaved }: JobPreviewPanelProps) {
    const { user } = useAuth()
    if (!job) {
        return (
            <Card className="h-full border-dashed flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Xem nhanh công việc</h3>
                <p className="text-sm max-w-xs">Di chuột vào một tin tuyển dụng bên trái để xem chi tiết tại đây</p>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden shadow-none rounded-none border-none bg-white">
            <div className="p-4 pb-0">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className={`w-full h-full ${job.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                        ) : (
                            <Building className="h-6 w-6 text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">{job.title}</h2>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0 whitespace-nowrap bg-white border-gray-200 font-normal text-gray-500">
                                {job.type === 'full-time' ? 'Toàn thời gian' : job.type === 'part-time' ? 'Bán thời gian' : job.type === 'internship' ? 'Thực tập' : 'Freelance'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mt-1">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{job.company}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
                <div className="p-4 pt-3 space-y-4">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-0 rounded-none border-none">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase mb-0.5">
                                <DollarSign className="h-3 w-3" />
                                Mức lương
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{job.salary}</div>
                        </div>
                        <div className="bg-white p-0 rounded-none border-none">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase mb-0.5">
                                <MapPin className="h-3 w-3" />
                                Địa điểm
                            </div>
                            <div className="font-semibold text-gray-900 text-sm truncate" title={job.location}>{job.location}</div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-3">
                        {/* Description */}
                        <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-wider">
                                Mô tả công việc
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {job.description}
                            </p>
                        </div>

                        {/* Requirements Preview */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-wider">
                                    Yêu cầu
                                </h4>
                                <ul className="space-y-1">
                                    {job.requirements.slice(0, 3).map((req: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                            <span className="line-clamp-1">{req}</span>
                                        </li>
                                    ))}
                                    {job.requirements.length > 3 && (
                                        <li className="text-xs text-primary font-medium pl-3.5">+ xem thêm {job.requirements.length - 3} yêu cầu khác</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Benefits Preview */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-wider">
                                    Quyền lợi
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.benefits.slice(0, 3).map((ben: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                                            {ben}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 pt-0 flex gap-3 shrink-0">
                <Button
                    className={`flex-1 h-9 text-sm ${(job.deadline && new Date(job.deadline).getTime() > 0 && new Date(job.deadline).getTime() < new Date().getTime()) || (user?.role === "employer" || user?.role === "admin") || (job.quantity !== undefined && job.quantity !== -1 && (job.hiredCount || 0) >= (job.quantity || 1))
                        ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed"
                        : "bg-black hover:bg-black/90 text-white"}`}
                    disabled={(!!job.deadline && new Date(job.deadline).getTime() > 0 && new Date(job.deadline).getTime() < new Date().getTime()) || (user?.role === "employer" || user?.role === "admin") || (job.quantity !== undefined && job.quantity !== -1 && (job.hiredCount || 0) >= (job.quantity || 1))}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (user?.role === "employer" || user?.role === "admin") return
                        onApply(job)
                    }}
                >
                    {job.deadline && new Date(job.deadline).getTime() > 0 && new Date(job.deadline).getTime() < new Date().getTime()
                        ? "Đã hết hạn"
                        : (job.quantity !== undefined && job.quantity !== -1 && (job.hiredCount || 0) >= (job.quantity || 1))
                            ? "Đã đóng nhận hồ sơ"
                            : (user?.role === "employer" || user?.role === "admin")
                                ? "Dành cho ứng viên"
                                : "Ứng tuyển"}
                </Button>
                <Link href={`/jobs/${job._id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-9 text-sm border-gray-200">
                        Xem chi tiết
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
