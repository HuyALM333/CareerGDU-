import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Clock, Building, Calendar, CheckCircle2, Briefcase, Globe, Users, Award, ArrowLeft, Send } from "lucide-react"

interface JobPreviewProps {
    data: any
    onBack: () => void
    onSubmit: () => void
    isLoading: boolean
}

export function JobPreview({ data, onBack, onSubmit, isLoading }: JobPreviewProps) {
    // Helper to format currency
    const formatSalary = () => {
        if (data.isNegotiable) return "Thỏa thuận"

        // Logic copied/adapted from form submission logic
        const min = data.salaryMin || 0
        const max = data.salaryMax || 0

        if (data.type === "part-time") {
            if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ/giờ`
            if (min) return `Từ ${min.toLocaleString()} VNĐ/giờ`
            if (max) return `Đến ${max.toLocaleString()} VNĐ/giờ`
        } else {
            const formatMoney = (val: number) => {
                if (val >= 1000000) return `${(val / 1000000).toLocaleString()} triệu`;
                return `${val.toLocaleString()} VNĐ`;
            }
            if (min && max) return `${formatMoney(min)} - ${formatMoney(max)}/tháng`
            if (min) return `Từ ${formatMoney(min)}/tháng`
            if (max) return `Đến ${formatMoney(max)}/tháng`
        }
        return "Thỏa thuận"
    }

    // Helper to parse requirements/benefits if they are strings (from textarea)
    const getList = (input: string | string[]) => {
        if (Array.isArray(input)) return input;
        if (!input) return [];
        return input.split('\n').filter(line => line.trim() !== "");
    }

    const requirements = getList(data.requirements);
    const detailedBenefits = getList(data.detailedBenefits);
    // data.benefits is usually an array from Checkbox group
    const commonBenefits = Array.isArray(data.benefits) ? data.benefits : [];

    const salaryString = formatSalary()

    // Format deadline
    const deadlineString = data.deadline ? new Date(data.deadline).toLocaleDateString('vi-VN') : "Vô thời hạn"
    const todayString = new Date().toLocaleDateString('vi-VN')

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Top Bar Actions */}
            <div className="bg-white border-b sticky top-0 z-50 px-4 py-3 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <Button variant="outline" onClick={onBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại chỉnh sửa
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full hidden sm:block">
                            Chế độ Xem trước
                        </div>
                        <Button onClick={onSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                            {isLoading ? "Đang xử lý..." : <><Send className="w-4 h-4" /> Đăng tin ngay</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative bg-[#1e3a5f] py-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                            {data.logoPreview || data.logo ? (
                                <img src={data.logoPreview || data.logo} alt={data.company} className={`w-full h-full ${data.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                            ) : (
                                <Building className="h-10 w-10 text-gray-400" />
                            )}
                        </div>

                        <div className="flex-1 text-white">
                            <h1 className="text-xl md:text-3xl font-bold mb-3 leading-tight">{data.title || "Tiêu đề công việc"}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-blue-100/90 text-sm md:text-base">
                                <span className="flex items-center gap-1.5">
                                    <Building className="h-4 w-4" />
                                    {data.company || "Tên doanh nghiệp"}
                                </span>
                                <span className="hidden md:inline text-blue-100/30">•</span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {data.location || "Địa điểm"}
                                </span>
                                <span className="hidden md:inline text-blue-100/30">•</span>
                                <Badge className="bg-white/10 text-white border-none px-2.5 py-0.5">
                                    {data.type === "full-time" ? "Toàn thời gian" :
                                        data.type === "part-time" ? "Bán thời gian" :
                                            data.type === "internship" ? "Thực tập" : "Freelance"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-6 relative z-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardContent className="p-6 md:p-8 space-y-8">
                                {/* Description Section */}
                                <section className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        Mô tả công việc
                                    </h2>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                        {data.description || "Chưa có mô tả"}
                                    </div>
                                </section>

                                <Separator />

                                {/* Requirements Section */}
                                <section className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        Yêu cầu ứng viên
                                    </h2>
                                    {requirements.length > 0 ? (
                                        <ul className="grid gap-2">
                                            {requirements.map((req: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100/50">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm md:text-base">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic">Chưa có yêu cầu chi tiết</p>
                                    )}
                                </section>

                                <Separator />

                                {/* Benefits Section */}
                                <section className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-[#1e3a5f]">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        Quyền lợi
                                    </h2>

                                    {/* Common Benefits */}
                                    {commonBenefits.length > 0 && (
                                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                            {commonBenefits.map((benefit: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-gray-700 bg-blue-50/30 p-3 rounded-lg border border-blue-50">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Detailed Benefits */}
                                    {detailedBenefits.length > 0 && (
                                        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                            {data.detailedBenefits}
                                        </div>
                                    )}

                                    {commonBenefits.length === 0 && detailedBenefits.length === 0 && (
                                        <p className="text-gray-500 italic">Chưa có thông tin quyền lợi</p>
                                    )}
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Key Info Card */}
                        <Card className="border-none shadow-lg bg-white ring-1 ring-gray-100">
                            <CardContent className="p-5">
                                <div className="space-y-5">
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        Thông tin chung
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Mức lương</p>
                                                    <p className="text-gray-900 font-bold text-sm">{salaryString}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Hạn nộp</p>
                                                    <p className="text-gray-900 font-bold text-sm">{deadlineString}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Số lượng</p>
                                                    <p className="text-gray-900 font-bold text-sm">
                                                        {data.unlimitedQuantity ? "Không giới hạn" : (data.quantity ? `${data.quantity} người` : "1 người")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Ngày đăng</p>
                                                    <p className="text-gray-900 font-bold text-sm">{todayString}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button disabled className="w-full bg-[#1e3a5f] opacity-80 cursor-not-allowed">
                                        Ứng tuyển ngay (Xem trước)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Company Info Mini Card */}
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Globe className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900">Website doanh nghiệp</p>
                                        <p className="text-sm text-blue-600 truncate">
                                            {data.website || "Đang cập nhật"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
