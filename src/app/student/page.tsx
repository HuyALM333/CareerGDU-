import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GraduationCap, Briefcase, FileText, TrendingUp, BookOpen, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentPage() {
  const features = [
    {
      icon: Briefcase,
      title: "Tìm việc làm phù hợp",
      description: "Hệ thống gợi ý công việc dựa trên kỹ năng và nguyện vọng của bạn",
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600",
    },
    {
      icon: FileText,
      title: "Tạo CV chuyên nghiệp",
      description: "Công cụ tạo CV miễn phí với nhiều mẫu đẹp, chuẩn doanh nghiệp",
      color: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-600",
    },
    {
      icon: TrendingUp,
      title: "Phát triển kỹ năng",
      description: "Khóa học và tài liệu giúp bạn nâng cao năng lực nghề nghiệp",
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-600",
    },
    {
      icon: BookOpen,
      title: "Tư vấn nghề nghiệp",
      description: "Đội ngũ chuyên gia hỗ trợ định hướng và tư vấn lộ trình sự nghiệp",
      color: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-600",
    },
    {
      icon: Users,
      title: "Kết nối doanh nghiệp",
      description: "Gặp gỡ trực tiếp với nhà tuyển dụng tại các sự kiện việc làm",
      color: "from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-600",
    },
    {
      icon: GraduationCap,
      title: "Chương trình thực tập",
      description: "Cơ hội thực tập tại các công ty hàng đầu ngay từ năm 2",
      color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-600",
    },
  ]

  const steps = [
    { number: "01", title: "Đăng ký tài khoản", description: "Tạo hồ sơ cá nhân miễn phí" },
    { number: "02", title: "Hoàn thiện CV", description: "Xây dựng CV ấn tượng với công cụ của chúng tôi" },
    { number: "03", title: "Tìm việc làm", description: "Khám phá hàng ngàn cơ hội phù hợp" },
    { number: "04", title: "Ứng tuyển", description: "Nộp đơn và theo dõi trạng thái ứng tuyển" },
  ]

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url(/students-working-in-modern-office.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">Khởi đầu sự nghiệp từ GDU Career</h1>
                <p className="text-xl text-primary-foreground/90 mb-8">
                  Nền tảng kết nối sinh viên GDU với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg">
                      Đăng ký ngay
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg"
                    >
                      Tìm việc làm
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Dịch vụ dành cho sinh viên</h2>
              <p className="text-muted-foreground text-lg">
                GDU Career cung cấp đầy đủ công cụ giúp bạn thành công trong hành trình tìm việc
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`p-6 bg-gradient-to-br ${feature.color} hover:shadow-lg transition-shadow backdrop-blur-sm`}
                >
                  <div className={`p-3 w-fit rounded-lg mb-4 ${feature.color}`}>
                    <feature.icon className={`h-8 w-8 ${feature.color.split(" ").pop()}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-b from-accent/50 to-background/50 py-16 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-foreground">Bắt đầu như thế nào?</h2>
                <p className="text-muted-foreground text-lg">4 bước đơn giản để tìm được công việc mơ ước</p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
                      <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </Card>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-muted-foreground">Việc làm</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-secondary mb-2">500+</div>
                <div className="text-muted-foreground">Doanh nghiệp</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
                <div className="text-muted-foreground">Sinh viên</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">92%</div>
                <div className="text-muted-foreground">Tỉ lệ thành công</div>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
              <p className="text-xl mb-8 text-secondary-foreground/90">
                Tham gia cùng hàng ngàn sinh viên GDU đã tìm được công việc mơ ước
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                  Đăng ký miễn phí ngay
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
