"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Users, Briefcase, Star, CheckCircle, ArrowLeft, Globe, Mail, Phone, Building, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface Company {
    id: string
    name: string
    logo: string
    industry: string
    size: string
    location: string
    description: string
    openPositions: number
    rating: number
    verified: boolean
    benefits: string[]
    website?: string
    email?: string
    phone?: string
}

// Industry-specific cover images
const getCoverImage = (company: Company) => {
    const industryImages: Record<string, string> = {
        "Công nghệ thông tin": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80", // Tech office
        "Ngân hàng": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", // Skyscrapers
        "Pháp luật": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80", // Gavel/Law
        "Luật": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80",
        "Marketing": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80", // Creative meeting
        "Giáo dục": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80", // University
        "Bất động sản": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80", // Modern building
        "Nhân sự": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80", // People shaking hands
        "Sản xuất": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80", // Factory/Industry
    }

    // Direct match or fallback to generic high-quality office images
    if (industryImages[company.industry]) {
        return industryImages[company.industry]
    }

    // Deterministic fallback based on ID
    const fallbacks = [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
    ]

    // Simple hash of ID to pick a fallback
    const index = company.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbacks.length
    return fallbacks[index]
}

export default function CompanyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [company, setCompany] = useState<Company | null>(null)
    const [similarCompanies, setSimilarCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [isFollowed, setIsFollowed] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Current Company
                const response = await fetch(`/api/companies/${params.id}`)
                const data = await response.json()

                if (data.company) {
                    setCompany(data.company)

                    // 2. Fetch All Companies for "Similar" section
                    const allCompaniesRes = await fetch(`/api/companies`)
                    const allData = await allCompaniesRes.json()

                    if (allData.companies) {
                        const others = allData.companies
                            .filter((c: Company) => c.id !== params.id)
                            .sort(() => 0.5 - Math.random()) // Shuffle
                            .slice(0, 3) // Take 3
                        setSimilarCompanies(others)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch company data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchData()
        }
    }, [params.id])

    const handleFollow = () => {
        setIsFollowed(!isFollowed)
        toast({
            title: isFollowed ? "Đã bỏ theo dõi" : "Đã theo dõi!",
            description: isFollowed ? `Bạn sẽ không nhận được thông báo từ ${company?.name} nữa.` : `Bạn sẽ nhận được thông báo mới nhất từ ${company?.name}.`,
        })
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast({
            title: "Đã sao chép liên kết",
            description: "Đã lưu đường dẫn trang vào bộ nhớ tạm.",
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="container mx-auto px-4 py-8 flex-1">
                    <Skeleton className="h-64 w-full rounded-xl mb-6" />
                    <div className="flex gap-6">
                        <Skeleton className="w-32 h-32 rounded-lg" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="p-12 text-center max-w-lg w-full">
                        <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold mb-4">Không tìm thấy doanh nghiệp</h2>
                        <p className="text-muted-foreground mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => router.push("/companies")} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                    </Card>
                </div>
                <Footer />
            </div>
        )
    }

    const coverImage = getCoverImage(company)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-1 pb-16">
                {/* Hero Banner Area - Dynamic Background */}
                <div className="relative h-[250px] md:h-[300px] bg-slate-900 overflow-hidden group">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: `url('${coverImage}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                    <div className="container mx-auto px-4 h-full relative">
                        <Button
                            variant="ghost"
                            className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                            onClick={() => router.push("/companies")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
                        </Button>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-24 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                        {/* Company Logo */}
                        <div className="bg-white p-2 rounded-xl shadow-xl shrink-0">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-lg overflow-hidden border border-slate-100 bg-white flex items-center justify-center relative">
                                <img
                                    src={company.logo || "/placeholder.svg"}
                                    alt={company.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="flex-1 pt-4 md:pt-28 text-slate-800 w-full">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-2">
                                        {company.name}
                                        {company.verified && <CheckCircle className="h-6 w-6 text-blue-500 fill-blue-50" />}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-slate-600">
                                        <Badge variant="outline" className="bg-white px-3 py-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                                            {company.industry}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <span>{company.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-600">
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            <span>{company.rating} / 5.0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className={`min-w-[120px] transition-all ${isFollowed ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                        onClick={handleFollow}
                                    >
                                        <Heart className={`h-4 w-4 mr-2 ${isFollowed ? 'fill-red-500 text-red-500' : ''}`} />
                                        {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                                    </Button>
                                    <Button variant="outline" className="bg-white" onClick={handleShare}>
                                        <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid md:grid-cols-12 gap-8">

                        {/* Left Column (Content) - 8 cols */}
                        <div className="md:col-span-8 space-y-8">

                            {/* Unified Card Container */}
                            <Card className="shadow-md border-0 ring-1 ring-slate-100 overflow-hidden">
                                <CardHeader className="bg-white border-b px-6 py-4">
                                    <Tabs defaultValue="about" className="w-full">
                                        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-6">
                                            <TabsTrigger
                                                value="about"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 py-3 text-base"
                                            >
                                                Về chúng tôi
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="jobs"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 py-3 text-base"
                                            >
                                                Tuyển dụng <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">{company.openPositions}</Badge>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="culture"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none px-0 py-3 text-base"
                                            >
                                                Văn hóa doanh nghiệp
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="mt-6">
                                            {/* About Content */}
                                            <TabsContent value="about" className="mt-0 animate-in fade-in-50 duration-300">
                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Giới thiệu chung</h3>
                                                        <div className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                                                            {company.description}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-blue-600 mb-1">{company.size}</div>
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nhân sự</div>
                                                        </div>
                                                        <div className="text-center border-l md:border-l border-slate-200">
                                                            <div className="text-2xl font-bold text-blue-600 mb-1">{new Date().getFullYear() - 2010}+</div>
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Năm hoạt động</div>
                                                        </div>
                                                        <div className="text-center border-l border-slate-200">
                                                            <div className="text-2xl font-bold text-blue-600 mb-1">Top 10</div>
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Uy tín</div>
                                                        </div>
                                                        <div className="text-center border-l border-slate-200">
                                                            <div className="text-2xl font-bold text-blue-600 mb-1">Global</div>
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thị trường</div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Tại sao bạn sẽ thích làm việc tại đây?</h3>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {company.benefits.map((benefit, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all h-full">
                                                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <span className="font-medium text-slate-700">{benefit}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            {/* Jobs Content */}
                                            <TabsContent value="jobs" className="mt-0 animate-in fade-in-50 duration-300">
                                                <div className="text-center py-12">
                                                    <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <Briefcase className="h-10 w-10 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                                        {company.openPositions} cơ hội nghề nghiệp đang chờ bạn
                                                    </h3>
                                                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                                                        Gia nhập đội ngũ {company.name} để phát huy tiềm năng và xây dựng sự nghiệp vững chắc.
                                                    </p>
                                                    <Link href={`/jobs?company=${encodeURIComponent(company.name)}`}>
                                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base">
                                                            Xem tất cả công việc
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TabsContent>

                                            {/* Culture Content */}
                                            <TabsContent value="culture" className="mt-0 animate-in fade-in-50 duration-300">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Placeholder gallery */}
                                                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer shadow-sm">
                                                        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80" alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                    </div>
                                                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer shadow-sm">
                                                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" alt="Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                    </div>
                                                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer col-span-2 shadow-sm">
                                                        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80" alt="Meeting" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                    </div>
                                                </div>
                                                <p className="text-center text-slate-500 mt-4 italic text-sm">
                                                    *Hình ảnh không gian làm việc chuyên nghiệp, hiện đại
                                                </p>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Right Column (Sidebar) - 4 cols */}
                        <div className="md:col-span-4 space-y-6">

                            {/* Contact Box - Sticky */}
                            <div className="sticky top-24 space-y-6">
                                <Card className="shadow-md border-t-4 border-t-blue-600 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Building className="h-5 w-5 text-blue-600" />
                                            Thông tin liên hệ
                                        </CardTitle>
                                    </CardHeader>
                                    <div className="h-[200px] w-full bg-slate-100 relative">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(company.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                                        ></iframe>
                                    </div>
                                    <CardContent className="space-y-4 pt-4">
                                        {company.website && (
                                            <div className="flex items-start gap-3 group">
                                                <Globe className="h-5 w-5 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-sm font-medium text-slate-500">Website</div>
                                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate block">
                                                        {company.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {company.email && (
                                            <div className="flex items-start gap-3 group">
                                                <Mail className="h-5 w-5 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-sm font-medium text-slate-500">Email</div>
                                                    <a href={`mailto:${company.email}`} className="text-slate-900 hover:text-blue-600 truncate block font-medium">
                                                        {company.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {company.phone && (
                                            <div className="flex items-start gap-3 group">
                                                <Phone className="h-5 w-5 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-500">Điện thoại</div>
                                                    <a href={`tel:${company.phone}`} className="text-slate-900 hover:text-blue-600 font-medium">{company.phone}</a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                                            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-500">Trụ sở chính</div>
                                                <p className="text-slate-900 text-sm leading-relaxed font-medium">{company.location}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Similar Companies */}
                                {similarCompanies.length > 0 && (
                                    <Card className="shadow-sm border-slate-200">
                                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                            <CardTitle className="text-base font-semibold text-slate-800">Doanh nghiệp tương tự</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="space-y-4">
                                                {similarCompanies.map((sim, i) => (
                                                    <Link key={i} href={`/companies/${sim.id}`} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                                            <img src={sim.logo} alt={sim.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{sim.name}</div>
                                                            <div className="text-xs text-slate-500 truncate">{sim.industry}</div>
                                                            <div className="text-xs text-blue-600 mt-0.5 font-medium flex items-center gap-1">
                                                                <Briefcase className="h-3 w-3" /> {sim.openPositions} việc làm
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
