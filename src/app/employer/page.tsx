import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Target, Users, BarChart3, Clock, Shield, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EmployerPage() {
  const benefits = [
    {
      icon: Target,
      title: "Tiếp cận nhân tài trẻ",
      description: "Kết nối với hơn 10,000+ sinh viên GDU - nguồn nhân lực chất lượng cao",
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600",
    },
    {
      icon: Users,
      title: "Tuyển dụng hiệu quả",
      description: "Hệ thống lọc ứng viên thông minh giúp tiết kiệm thời gian và chi phí",
      color: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-600",
    },
    {
      icon: BarChart3,
      title: "Phân tích chi tiết",
      description: "Dashboard thống kê hiệu suất tuyển dụng và insights về ứng viên",
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-600",
    },
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      description: "Quản lý tin tuyển dụng, ứng viên và lịch phỏng vấn tập trung",
      color: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-600",
    },
    {
      icon: Shield,
      title: "Thương hiệu tuyển dụng",
      description: "Xây dựng và quảng bá thương hiệu doanh nghiệp đến sinh viên",
      color: "from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-600",
    },
    {
      icon: Zap,
      title: "Hỗ trợ tận tâm",
      description: "Đội ngũ chuyên viên tư vấn và hỗ trợ 24/7",
      color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-600",
    },
  ]

  const packages = [
    {
      name: "Gói cơ bản",
      price: "Miễn phí",
      features: ["Đăng 3 tin tuyển dụng/tháng", "Xem CV ứng viên", "Hỗ trợ email"],
      highlight: false,
    },
    {
      name: "Gói chuyên nghiệp",
      price: "2,000,000đ/tháng",
      features: [
        "Đăng không giới hạn tin tuyển dụng",
        "Tìm kiếm ứng viên chủ động",
        "Dashboard phân tích",
        "Hỗ trợ ưu tiên",
        "Logo nổi bật",
      ],
      highlight: true,
    },
    {
      name: "Gói doanh nghiệp",
      price: "Liên hệ",
      features: [
        "Tất cả tính năng Gói Chuyên Nghiệp",
        "Tham gia Job Fair",
        "Tài khoản phụ không giới hạn",
        "API tích hợp",
        "Account Manager riêng",
      ],
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url(/job-fair-event-with-students-and-employers.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-secondary via-secondary to-secondary/80 text-secondary-foreground py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">Tìm kiếm nhân tài cùng GDU Career</h1>
                <p className="text-xl text-secondary-foreground/90 mb-8">
                  Kết nối với hơn 10,000+ sinh viên tài năng từ Đại học Gia Định - Nguồn nhân lực chất lượng cao cho
                  doanh nghiệp
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                      Đăng tin tuyển dụng
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 text-lg"
                  >
                    Xem bảng giá
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Lợi ích khi sử dụng GDU Career</h2>
              <p className="text-muted-foreground text-lg">
                Giải pháp tuyển dụng toàn diện giúp doanh nghiệp tìm được nhân tài phù hợp
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className={`p-6 bg-gradient-to-br ${benefit.color} hover:shadow-lg transition-shadow backdrop-blur-sm`}
                >
                  <div className={`p-3 w-fit rounded-lg mb-4 ${benefit.color}`}>
                    <benefit.icon className={`h-8 w-8 ${benefit.color.split(" ").pop()}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-b from-accent/50 to-background/50 py-16 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-foreground">Bảng giá dịch vụ</h2>
                <p className="text-muted-foreground text-lg">
                  Chọn gói phù hợp với nhu cầu tuyển dụng của doanh nghiệp
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {packages.map((pkg, index) => (
                  <Card
                    key={index}
                    className={`p-8 ${pkg.highlight
                      ? "border-secondary border-2 shadow-xl bg-gradient-to-br from-secondary/5 to-secondary/10 backdrop-blur-sm"
                      : "bg-card/80 backdrop-blur-sm"
                      }`}
                  >
                    {pkg.highlight && (
                      <div className="bg-secondary text-secondary-foreground text-sm font-semibold px-3 py-1 rounded-full w-fit mb-4">
                        Phổ biến nhất
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{pkg.name}</h3>
                    <div className="text-3xl font-bold mb-6 text-primary">{pkg.price}</div>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-green-600" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${pkg.highlight ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
                        }`}
                    >
                      {pkg.price === "Liên hệ" ? "Liên hệ tư vấn" : "Chọn gói"}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Con số ấn tượng</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Doanh nghiệp</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-secondary mb-2">10,000+</div>
                <div className="text-muted-foreground">Ứng viên</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-muted-foreground">Tin tuyển dụng</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-muted-foreground">Hài lòng</div>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Bắt đầu tuyển dụng ngay hôm nay</h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Hàng trăm doanh nghiệp đã tin tưởng sử dụng GDU Career
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg">
                  Đăng ký dùng thử miễn phí
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
