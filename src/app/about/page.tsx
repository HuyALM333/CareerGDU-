"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    CheckCircle,
    Target,
    Users,
    Zap,
    Clock,
    Wallet,
    Briefcase,
    Building2,
    BookOpen,
    Star
} from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden bg-[#0f172a] text-white">
                    <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-transparent" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium mb-6 backdrop-blur-sm">
                                Triết lý giáo dục: Chọn lọc – Ứng dụng – Đại chúng
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                CỔNG THÔNG TIN VIỆC LÀM <br />
                                <span className="text-blue-500">ĐẠI HỌC GIA ĐỊNH (GDU)</span>
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed mb-8 border-l-4 border-blue-500 pl-6">
                                Chúng tôi không chỉ là nơi đào tạo kiến thức mà còn là cầu nối vững chắc giữa sinh viên và thị trường lao động.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision & Core Values */}
                <section className="py-20 container mx-auto px-4 -mt-20 relative z-20">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-600">
                            <CardContent className="p-8 md:p-10">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Target className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">Tầm nhìn</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Trở thành trường đại học đa ngành, đa lĩnh vực theo định hướng ứng dụng, cung ứng nguồn nhân lực chất lượng cao phù hợp với nhu cầu của nền kinh tế số.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-600">
                            <CardContent className="p-8 md:p-10">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Zap className="h-7 w-7 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">Giá trị cốt lõi</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Tập trung vào tính thực tiễn, lược bỏ các lý thuyết hàn lâm không cần thiết để sinh viên có thể thích nghi ngay với môi trường doanh nghiệp.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Why Choose GDU */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Tại sao nên chọn GDU?</h2>
                            <p className="text-lg text-slate-600">
                                GDU khẳng định vị thế là lựa chọn hàng đầu cho sinh viên mong muốn khởi nghiệp sớm nhờ vào các thế mạnh vượt trội
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard
                                icon={<Clock className="h-6 w-6 text-blue-600" />}
                                title="Thời gian đào tạo tối ưu"
                                desc="Chương trình cử nhân rút ngắn chỉ còn 3 năm (8 học kỳ), giúp sinh viên gia nhập thị trường lao động sớm hơn."
                            />
                            <FeatureCard
                                icon={<Wallet className="h-6 w-6 text-green-600" />}
                                title="Học phí 'đại chúng'"
                                desc="Mức học phí phù hợp với đa số gia đình Việt Nam, đi kèm nhiều chính sách học bổng hấp dẫn lên đến 20%."
                            />
                            <FeatureCard
                                icon={<Briefcase className="h-6 w-6 text-purple-600" />}
                                title="96% có việc làm"
                                desc="Con số ấn tượng chứng minh cho chất lượng đào tạo bám sát thực tế của Nhà trường."
                            />
                            <FeatureCard
                                icon={<Building2 className="h-6 w-6 text-orange-600" />}
                                title="Trải nghiệm thực tế"
                                desc="Sinh viên được kiến tập, tham quan doanh nghiệp ngay từ khi mới bước chân vào trường năm nhất."
                            />
                        </div>
                    </div>
                </section>

                {/* Success Stories */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-12 text-center">
                            Kết nối những "Nhân tài tương lai"
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <StoryCard
                                name="Trần Lê Quang Vinh"
                                role="Kỹ sư bảo mật cao cấp - HPT"
                                major="Ngành CNTT"
                                content="Trở thành Kỹ sư bảo mật cao cấp tại Công ty HPT sau khi gặp gỡ nhà tuyển dụng ngay tại hội thảo của trường."
                                initials="TV"
                            />
                            <StoryCard
                                name="Văn Chiến"
                                role="Chuyên viên Truyền thông"
                                major="Ngành Truyền thông đa phương tiện"
                                content="Tìm được công việc đúng chuyên ngành tại công ty truyền thông uy tín khi vẫn còn ngồi trên ghế nhà trường."
                                initials="VC"
                            />
                            <StoryCard
                                name="Hứa Gia Phúc"
                                role="Rapper / Content Creator"
                                major="Ngành Truyền thông đa phương tiện"
                                content="Một sinh viên tài năng khẳng định 'chất riêng' qua nghệ thuật Rap và truyền thông thực chiến."
                                initials="GP"
                            />
                        </div>
                    </div>
                </section>

                {/* Partners & Ecosystem */}
                <section className="py-20 bg-[#0f172a] text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Hệ sinh thái Đối tác và <br /> Giá trị Nghề nghiệp</h2>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                    Cổng thông tin việc làm GDU không chỉ cung cấp "chỗ làm", mà cung cấp một lộ trình sự nghiệp bền vững thông qua việc ký kết chiến lược với hơn <span className="text-blue-400 font-bold text-xl">200 doanh nghiệp uy tín</span>.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Briefcase className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Lĩnh vực kết nối đa dạng</h4>
                                            <p className="text-slate-400">Công nghệ thông tin, Tài chính - Ngân hàng, Thương mại điện tử, Logistics, Luật, Marketing, Truyền thông.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Giá trị tạo ra</h4>
                                            <p className="text-slate-400">Các doanh nghiệp trực tiếp tham gia đóng góp ý kiến cho chương trình giảng dạy, đảm bảo sinh viên được học những gì thị trường thực sự cần.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
                                <h3 className="text-xl font-bold mb-6 text-center">Đối tác chiến lược tiêu biểu</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {["Techcombank", "Tiki", "MobiFone", "VECOM", "Thiên Khôi Group", "Udacity Korea"].map((partner) => (
                                        <div key={partner} className="bg-white/10 rounded-lg p-4 flex items-center justify-center text-center font-medium hover:bg-white/20 transition-colors">
                                            {partner}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Student Center */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <div className="mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-6">
                                Trung tâm Trải nghiệm - Việc làm Sinh viên
                            </h2>
                            <p className="text-xl text-blue-600 font-medium mb-8">
                                "Người đồng hành tận tâm"
                            </p>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                                Đây là "trái tim" của các hoạt động kết nối, nơi đảm bảo mỗi sinh viên GDU đều nhận được sự hỗ trợ tốt nhất.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <ServiceItem
                                title="Tư vấn hướng nghiệp"
                                desc="Đào tạo kỹ năng viết CV và phỏng vấn chuyên nghiệp."
                            />
                            <ServiceItem
                                title="Cầu nối việc làm"
                                desc="Giới thiệu các vị trí thực tập, kiến tập và việc làm phổ thông cho sinh viên."
                            />
                            <ServiceItem
                                title="Job Fair định kỳ"
                                desc="Tổ chức các ngày hội tuyển dụng, giúp sinh viên đối thoại trực tiếp với lãnh đạo doanh nghiệp."
                            />
                        </div>

                        <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-lg md:text-xl font-medium text-[#0f172a] italic">
                                "Cổng thông tin việc làm GDU cam kết mang đến những cơ hội tốt nhất để mỗi sinh viên không chỉ có một tấm bằng, mà có một sự nghiệp rạng rỡ ngay từ khi tốt nghiệp."
                            </p>
                            <div className="mt-8">
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                                    <Link href="/jobs">Tìm việc làm ngay</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    )
}

function StoryCard({ name, role, major, content, initials }: { name: string, role: string, major: string, content: string, initials: string }) {
    return (
        <Card className="bg-white border-none shadow-lg overflow-hidden flex flex-col h-full">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardContent className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                        {initials}
                    </div>
                    <div>
                        <h4 className="font-bold text-[#0f172a] text-lg">{name}</h4>
                        <div className="text-blue-600 text-sm font-medium">{major}</div>
                    </div>
                </div>
                <div className="mb-6 flex-1">
                    <p className="text-slate-600 italic">"{content}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        {role}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ServiceItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                    <h4 className="font-bold text-lg text-[#0f172a] mb-2">{title}</h4>
                    <p className="text-slate-600">{desc}</p>
                </div>
            </div>
        </div>
    )
}
