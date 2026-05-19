import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ContactForm } from "@/components/contact/contact-form"
import { MapPin, Mail, Clock, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

async function getBannerData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/hero-slides?page=contact`, { next: { revalidate: 60 } })
    const data = await res.json()
    if (data.success && data.data.length > 0) {
      return data.data[0]
    }
    return null
  } catch (error) {
    console.error("Error fetching contact banner:", error)
    return null
  }
}

export default async function ContactPage() {
  const banner = await getBannerData()
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <div className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url('${banner?.image || '/hero-bg.png'}')` }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-primary/85" />

          {/* Content */}
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3 text-white tracking-tight">
              {banner?.title || "Liên hệ với chúng tôi"}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {banner?.subtitle || "Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh bên dưới."}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Địa chỉ</h3>
                    <p className="text-muted-foreground">371 Nguyễn Kiệm, Phường Hạnh Thông, Tp. Hồ Chí Minh</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-500/20">
                <a
                  href="https://m.me/GDUStudentCenter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg shrink-0">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Messenger</h3>
                    <p className="text-muted-foreground">Chat trực tiếp qua Facebook</p>
                    <p className="text-primary font-medium">Nhắn tin ngay →</p>
                  </div>
                </a>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-[#0068FF]/10 to-[#0068FF]/5 border-[#0068FF]/20">
                <a
                  href="https://zalo.me/0796079423"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="p-3 bg-[#0068FF]/20 rounded-lg shrink-0 flex items-center justify-center">
                    <span className="font-bold text-[#0068FF]">Zalo</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Zalo</h3>
                    <p className="text-muted-foreground">Chat nhanh qua Zalo</p>
                    <p className="text-primary font-medium">Nhắn tin ngay →</p>
                  </div>
                </a>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Email</h3>
                    <p className="text-muted-foreground">Studentcentre@giadinh.edu.vn</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Giờ làm việc</h3>
                    <p className="text-muted-foreground">Thứ 2 - Thứ 6: 8:00 - 17:00</p>

                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 shadow-lg bg-card">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Gửi tin nhắn cho chúng tôi</h2>
                <ContactForm />
              </Card>
            </div>
          </div>

          {/* Map */}
          <Card className="mt-8 overflow-hidden shadow-lg">
            <iframe
              src="https://maps.google.com/maps?q=371%20Nguy%E1%BB%85n%20Ki%E1%BB%87m%2C%20Ph%C6%B0%E1%BB%9Dng%20H%E1%BA%A1nh%20Th%C3%B4ng%2C%20Tp.%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
