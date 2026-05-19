import { Users, Briefcase, Building2, Award } from "lucide-react"

const stats = [
  { icon: Users, value: "18+", label: "Năm kinh nghiệm đào tạo", color: "from-blue-500 to-blue-600" },
  { icon: Briefcase, value: "69+", label: "Ngành/Chuyên ngành", color: "from-green-500 to-green-600" },
  { icon: Building2, value: "100+", label: "Doanh nghiệp đối tác", color: "from-purple-500 to-purple-600" },
  { icon: Award, value: "95%", label: "Sinh viên có việc làm", color: "from-orange-500 to-orange-600" },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full mb-4 shadow-lg`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-primary-foreground/90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
