"use client"

import { Suspense, useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JobsListClient } from "@/components/jobs/jobs-list-client"
import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    Briefcase,
    GraduationCap,
    Users,
    TrendingUp,
    Building2,
    Globe,
    Award,
    BookOpen,
    MapPin,
    CheckCircle2,
    ArrowRight
} from "lucide-react"
import { Job } from "@/lib/jobs-data"
import Link from "next/link"

const benefits = [
    {
        icon: GraduationCap,
        title: "Đào tạo thực chiến",
        description: "Chương trình được xây dựng từ nhu cầu doanh nghiệp, gắn với dự án thực tế"
    },
    {
        icon: Globe,
        title: "Trải nghiệm quốc tế",
        description: "Cơ hội học tập và thực tập tại các trường đại học, doanh nghiệp trên thế giới"
    },
    {
        icon: Users,
        title: "Đội ngũ chuyên gia",
        description: "Giảng viên giàu kinh nghiệm, đồng hành và hỗ trợ sinh viên phát triển"
    },
    {
        icon: Building2,
        title: "Liên kết doanh nghiệp",
        description: "Mạng lưới 100+ doanh nghiệp đối tác hỗ trợ thực tập và việc làm"
    }
]

const stats = [
    { number: "18+", label: "Năm kinh nghiệm đào tạo" },
    { number: "69+", label: "Ngành/Chuyên ngành" },
    { number: "100+", label: "Doanh nghiệp đối tác" },
    { number: "95%", label: "Sinh viên có việc làm" }
]

const majors = [
    "Công nghệ thông tin",
    "Quản trị kinh doanh",
    "Marketing - Truyền thông số",
    "Tài chính - Ngân hàng",
    "Logistics & Chuỗi cung ứng",
    "Ngôn ngữ Anh",
    "Thiết kế đồ họa",
    "Luật kinh tế"
]

export default function InternshipsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { toast } = useToast()
    const [internshipJobs, setInternshipJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<{ title: string; company: string; jobId: string; creatorId?: string; companyEmail?: string; companyPhone?: string; companyWebsite?: string; jobType?: string } | null>(null)

    const handleApply = (jobId: string, jobTitle: string, company: string, creatorId?: string, email?: string, phone?: string, website?: string, jobType?: string) => {
        if (!user) {
            router.push("/login?redirect=/internships")
            return
        }
        setSelectedJob({
            title: jobTitle,
            company: company,
            jobId: jobId,
            creatorId: creatorId,
            companyEmail: email,
            companyPhone: phone,
            companyWebsite: website,
            jobType: jobType
        })
        setIsApplyDialogOpen(true)
    }

    useEffect(() => {
        async function fetchInternships() {
            try {
                const response = await fetch("/api/jobs")
                if (response.ok) {
                    const result = await response.json()
                    // API returns { success: true, data: { jobs: [...] } }
                    const allJobs = result.data?.jobs || result || []
                    // Filter for internship jobs (by type or title containing "thực tập" or "intern")
                    const filtered = allJobs.filter((job: Job) => {
                        const titleLower = job.title.toLowerCase()
                        const typeLower = (job.type || "").toLowerCase()
                        return (
                            typeLower === "internship" ||
                            typeLower === "thực tập" ||
                            typeLower === "part-time" ||
                            titleLower.includes("thực tập") ||
                            titleLower.includes("intern") ||
                            titleLower.includes("thực tập sinh")
                        )
                    })
                    setInternshipJobs(filtered)
                }
            } catch (error) {
                console.error("Error fetching internships:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInternships()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative py-24 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/internship-program-students-learning.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0077B6]/95 via-[#1e3a5f]/90 to-[#0077B6]/85" />

                    {/* Decorative elements */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0077B6]/20 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/20">
                            <img src="/gdu-logo.png" alt="GDU" className="h-8 w-auto object-contain" />
                            <span className="text-white font-medium">Trường Đại học Gia Định</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
                            Chương trình Thực tập
                            <span className="block text-[#7DD3FC]">Sinh viên GDU</span>
                        </h1>
                        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Bước chân đầu tiên vào thế giới nghề nghiệp - Khám phá hàng trăm vị trí thực tập
                            từ các doanh nghiệp hàng đầu, được hỗ trợ toàn diện từ nhà trường
                        </p>

                        {/* Stats bar */}
                        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                                    <div className="text-sm text-white/70">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="#internship-jobs"
                                className="inline-flex items-center gap-2 bg-white text-[#0077B6] px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Briefcase className="h-5 w-5" />
                                Xem vị trí thực tập
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="https://giadinh.edu.vn"
                                target="_blank"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                            >
                                <Globe className="h-5 w-5" />
                                Tìm hiểu về GDU
                            </Link>
                        </div>
                    </div>
                </div>

                {/* About GDU Section */}
                <div className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-[#0077B6]/10 text-[#0077B6] px-4 py-2 rounded-full mb-4 font-medium">
                                    <Award className="h-4 w-4" />
                                    Giới thiệu
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                                    Trường Đại học Gia Định
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                                    Trường Đại học Gia Định là một trong những cơ sở giáo dục uy tín hàng đầu tại Việt Nam,
                                    đào tạo đa ngành với cam kết mang đến cơ hội thực tập và việc làm cho sinh viên sau khi tốt nghiệp.
                                </p>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Với phương châm <strong>"Học tập suốt đời – Phát triển bền vững"</strong>, GDU cam kết mang lại
                                    môi trường học tập linh hoạt, hiện đại, giúp sinh viên nâng cao năng lực và thích ứng với thời đại mới.
                                </p>

                                <div className="flex items-center gap-3 text-gray-600 mb-4">
                                    <MapPin className="h-5 w-5 text-[#0077B6]" />
                                    <span>371 Nguyễn Kiệm, Phường Hạnh Thông, Gò Vấp, TP.HCM</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {majors.slice(0, 4).map((major, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                        >
                                            {major}
                                        </span>
                                    ))}
                                    <span className="px-3 py-1.5 bg-[#0077B6]/10 text-[#0077B6] rounded-full text-sm font-medium">
                                        +{majors.length - 4} ngành khác
                                    </span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="bg-gradient-to-br from-[#0077B6] to-[#1e3a5f] rounded-2xl p-8 text-white">
                                    <h3 className="text-2xl font-bold mb-6">Tại sao chọn GDU?</h3>
                                    <div className="space-y-4">
                                        {[
                                            "Đào tạo thực chiến, gắn với thực tiễn doanh nghiệp",
                                            "Cơ hội trải nghiệm quốc tế và liên kết doanh nghiệp",
                                            "Đội ngũ giảng viên giàu kinh nghiệm và nhiệt huyết",
                                            "Cơ sở vật chất khang trang, không gian xanh mát",
                                            "Hỗ trợ sinh viên toàn diện từ học bổng đến việc làm"
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-[#7DD3FC] flex-shrink-0 mt-0.5" />
                                                <span className="text-white/90">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/20">
                                        <Link
                                            href="https://giadinh.edu.vn/tai-sao-nen-chon-gdu"
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-[#7DD3FC] hover:text-white transition-colors font-medium"
                                        >
                                            Tìm hiểu thêm
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-[#0077B6]/10 text-[#0077B6] px-4 py-2 rounded-full mb-4 font-medium">
                                <BookOpen className="h-4 w-4" />
                                Lợi ích
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Lợi ích khi thực tập cùng GDU
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Sinh viên GDU được hỗ trợ toàn diện trong suốt quá trình thực tập,
                                từ kết nối doanh nghiệp đến hướng dẫn chuyên môn
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#0077B6] to-[#1e3a5f] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <benefit.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-3 text-gray-900">{benefit.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Internship Jobs List */}
                <div id="internship-jobs" className="container mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Vị trí thực tập đang tuyển
                            </h2>
                            {!loading && (
                                <p className="text-gray-600 mt-2">
                                    Tìm thấy <span className="font-semibold text-[#0077B6]">{internshipJobs.length}</span> vị trí thực tập phù hợp
                                </p>
                            )}
                        </div>
                        <Link
                            href="/jobs"
                            className="inline-flex items-center gap-2 text-[#0077B6] hover:text-[#005a8c] font-medium transition-colors"
                        >
                            Xem tất cả việc làm
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Vị trí thực tập nổi bật
                        </h2>
                        <p className="text-gray-600">
                            Danh sách các cơ hội thực tập tốt nhất dành cho sinh viên GDU
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0077B6] border-t-transparent"></div>
                            <p className="mt-4 text-gray-600">Đang tải danh sách thực tập...</p>
                        </div>
                    ) : internshipJobs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {internshipJobs.map((job) => (
                                    <Card key={job._id} className="group hover:border-[#0077B6]/50 transition-all duration-300 bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer h-full" onClick={() => router.push(`/jobs/${job._id}`)}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-lg border border-gray-100 bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                    {job.logo ? (
                                                        <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building2 className="h-8 w-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0077B6] transition-colors line-clamp-1">
                                                                {job.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                                <Building2 className="h-3.5 w-3.5" />
                                                                {job.company}
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-transparent hover:bg-blue-100 whitespace-nowrap">
                                                            {job.type === 'internship' ? 'Thực tập' : (job.type === 'part-time' ? 'Bán thời gian' : job.type)}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {job.location}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                            <span className="text-green-600 font-medium">{job.salary}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                                        <span className="text-xs text-gray-400">
                                                            Đăng ngày: {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleApply(job._id, job.title, job.company, job.creatorId, job.contactEmail, job.contactPhone, job.website, job.type)
                                                            }}
                                                            className="bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-sm h-9 px-4 text-sm"
                                                        >
                                                            Ứng tuyển
                                                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <ApplyJobDialog
                                isOpen={isApplyDialogOpen}
                                onClose={() => setIsApplyDialogOpen(false)}
                                jobTitle={selectedJob?.title || ""}
                                companyName={selectedJob?.company || ""}
                                jobId={selectedJob?.jobId}
                                employerId={selectedJob?.creatorId}
                                companyEmail={selectedJob?.companyEmail}
                                companyPhone={selectedJob?.companyPhone}
                                companyWebsite={selectedJob?.companyWebsite}
                                jobType={selectedJob?.jobType}
                            />
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <GraduationCap className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Chưa có vị trí thực tập</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Hiện tại chưa có vị trí thực tập nào được đăng tuyển.
                                Vui lòng quay lại sau hoặc xem tất cả việc làm có sẵn.
                            </p>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 bg-[#0077B6] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#005a8c] transition-colors shadow-lg"
                            >
                                <Briefcase className="h-5 w-5" />
                                Xem tất cả việc làm
                            </Link>
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-[#0077B6] to-[#1e3a5f] py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Sẵn sàng bắt đầu hành trình thực tập?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
                            Đăng ký tài khoản ngay để ứng tuyển các vị trí thực tập hấp dẫn
                            và nhận thông báo về cơ hội mới nhất
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 bg-white text-[#0077B6] px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
                            >
                                Đăng ký ngay
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                            >
                                Liên hệ tư vấn
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
