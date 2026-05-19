"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Clock, DollarSign, Calendar, FileText, Download, Eye, Maximize2, Minimize2, GraduationCap, Briefcase, Users, Mail, Phone, Tag } from "lucide-react"
import Image from "next/image"

// Define a robust Job type that covers all potential fields
export type Job = {
    _id: string
    title: string
    company: string
    logo?: string
    status: "pending" | "scheduled" | "published" | "rejected" | "expired" | "closed" | "request_changes"
    postedAt: string
    publishAt?: string
    approvedAt?: string
    expiredAt?: string
    type: string
    salary: string
    location?: string
    description?: string
    requirements?: string[]
    benefits?: string[]
    detailedBenefits?: string | string[]
    deadline?: string
    unlimitedDeadline?: boolean
    documentUrl?: string
    documentName?: string
    // New fields
    experience?: string
    education?: string
    field?: string
    relatedMajors?: string[]
    quantity?: number | string
    unlimitedQuantity?: boolean
    contactEmail?: string
    contactPhone?: string
}

// Helpers for labeling
const getExperienceLabel = (val?: string) => {
    const opts: Record<string, string> = {
        "no-exp": "Chưa có kinh nghiệm",
        "under-1": "Dưới 1 năm",
        "1-2": "1 - 2 năm",
        "2-5": "2 - 5 năm",
        "5-10": "5 - 10 năm",
        "above-10": "Trên 10 năm"
    }
    return val ? (opts[val] || val) : "Không yêu cầu"
}

const getEducationLabel = (val?: string) => {
    const opts: Record<string, string> = {
        "high-school": "Trung học phổ thông",
        "college": "Cao đẳng",
        "bachelor": "Đại học",
        "master": "Thạc sĩ",
        "phd": "Tiến sĩ"
    }
    return val ? (opts[val] || val) : "Không yêu cầu"
}

const getTypeLabel = (val: string) => {
    const opts: Record<string, string> = {
        "full-time": "Toàn thời gian",
        "part-time": "Bán thời gian",
        "internship": "Thực tập"
    }
    return opts[val] || val
}

interface JobPreviewDialogProps {
    job: Job | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JobPreviewDialog({ job, open, onOpenChange }: JobPreviewDialogProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!job) return null

    const handleOpenChange = (openState: boolean) => {
        if (!openState) {
            setIsExpanded(false)
        }
        onOpenChange(openState)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`${isExpanded ? 'max-w-[98vw] w-[98vw] h-[98vh]' : 'max-w-4xl w-[95vw] sm:w-full h-[90vh]'} overflow-y-auto p-0 gap-0 border border-gray-200 shadow-2xl rounded-2xl sm:rounded-xl transition-all duration-300`}>
                <DialogHeader className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex flex-row items-center justify-between space-y-0 pr-14">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Chi tiết tin tuyển dụng</DialogTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        title={isExpanded ? "Thu nhỏ" : "Phóng to toàn màn hình"}
                    >
                        {isExpanded ? <Minimize2 className="h-5 w-5 text-gray-600" /> : <Maximize2 className="h-5 w-5 text-gray-600" />}
                    </Button>
                </DialogHeader>

                <div className="p-4 sm:p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                            <Image
                                src={job.logo || "/placeholder.svg?height=100&width=100"}
                                alt={job.company}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                {job.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                                    <span className="font-semibold text-gray-700 text-sm sm:text-base">{job.company}</span>
                                </div>
                                {job.field && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="text-gray-600 text-sm sm:text-base">{job.field}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>Đăng ngày: {new Date((job as any).publishAt || job.postedAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-green-50 rounded-lg shrink-0">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Mức lương</p>
                                <p className="font-bold text-sm text-gray-900 truncate">{job.salary}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Địa điểm</p>
                                <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{job.location || "Chưa cập nhật"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Loại hình</p>
                                <p className="font-bold text-sm text-gray-900 capitalize">{getTypeLabel(job.type)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                <Briefcase className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Kinh nghiệm</p>
                                <p className="font-bold text-sm text-gray-900 truncate">{getExperienceLabel(job.experience)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                                <GraduationCap className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Học vấn</p>
                                <p className="font-bold text-sm text-gray-900 truncate">{getEducationLabel(job.education)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-pink-50 rounded-lg shrink-0">
                                <Users className="h-5 w-5 text-pink-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Số lượng</p>
                                <p className="font-bold text-sm text-gray-900">
                                    {job.unlimitedQuantity ? "Không giới hạn" : (job.quantity ? `${job.quantity} người` : "Chưa cập nhật")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-2 bg-red-50 rounded-lg shrink-0">
                                <Calendar className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Hạn nộp</p>
                                <p className="font-bold text-sm text-gray-900">
                                    {job.unlimitedDeadline ? "Vô thời hạn" : (job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Chưa cập nhật")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Majors */}
                    {job.relatedMajors && job.relatedMajors.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Chuyên ngành liên quan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.relatedMajors.map((major, i) => (
                                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 py-1 px-3">
                                        {major}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Content */}
                    <div className="grid grid-cols-1 gap-8">
                        {job.description && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Mô tả công việc</h3>
                                <div className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</div>
                            </div>
                        )}

                        {job.requirements && job.requirements.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Yêu cầu ứng viên</h3>
                                <ul className="grid grid-cols-1 gap-2">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-700">
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {(job.benefits && job.benefits.length > 0 || job.detailedBenefits) && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Quyền lợi</h3>
                                {job.benefits && job.benefits.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {job.benefits.map((benefit, i) => (
                                            <Badge key={i} variant="outline" className="border-green-200 bg-green-50/50 text-green-700">
                                                {benefit}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {job.detailedBenefits && (
                                    <div className="text-gray-700 whitespace-pre-line leading-relaxed bg-green-50/20 p-4 rounded-xl border border-green-50">
                                        {Array.isArray(job.detailedBenefits)
                                            ? job.detailedBenefits.join('\n')
                                            : job.detailedBenefits}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Info */}
                        {(job.contactEmail || job.contactPhone) && (
                            <div className="space-y-3 pt-6 border-t">
                                <h3 className="text-lg font-bold text-gray-900">Thông tin liên hệ</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {job.contactEmail && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{job.contactEmail}</span>
                                        </div>
                                    )}
                                    {job.contactPhone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{job.contactPhone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {job.documentUrl && (
                            <div className="pt-6 border-t font-sans">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Tài liệu đính kèm</h3>
                                <div className="flex items-center gap-4 p-5 border rounded-2xl bg-blue-50/30 group transition-all hover:bg-blue-50/50">
                                    <div className="p-3 bg-white rounded-xl border shadow-sm group-hover:scale-110 transition-transform">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate text-lg">{job.documentName || "Tai-lieu-dinh-kem"}</p>
                                        <p className="text-sm text-gray-500">Tài liệu chi tiết đính kèm cho tin tuyển dụng này</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <a
                                            href={job.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Xem nhanh
                                        </a>
                                        <a
                                            href={job.documentUrl}
                                            download={job.documentName || "tai-lieu"}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-100 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                                        >
                                            <Download className="h-4 w-4" />
                                            Tải ngay
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
