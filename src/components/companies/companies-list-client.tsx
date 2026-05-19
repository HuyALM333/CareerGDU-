"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Users, Briefcase, Star, CheckCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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
}

export function CompaniesListClient() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, selectedIndustry])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedIndustry) params.append("industry", selectedIndustry)

      const response = await fetch(`/api/companies?${params}`)
      const data = await response.json()
      setCompanies(data.companies)
    } catch (error) {
      console.error("[v0] Failed to fetch companies:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách công ty. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (companyId: string) => {
    router.push(`/companies/${companyId}`)
  }

  const industries = [
    "Tất cả",
    "Ngân hàng",
    "Công nghệ thông tin",
    "Công nghệ - Khởi nghiệp",
    "Quản lý bất động sản",
    "EdTech - Giáo dục",
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6 bg-card shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm công ty, ngành nghề..."
              className="w-full pl-10 pr-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value === "Tất cả" ? "" : e.target.value)}
            className="px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            {industries.map((industry) => (
              <option key={industry} value={industry === "Tất cả" ? "" : industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-muted-foreground">
        Tìm thấy <span className="font-semibold text-foreground">{companies.length}</span> doanh nghiệp
      </div>

      {/* Companies grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-20 rounded-lg mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy doanh nghiệp phù hợp</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow bg-card flex flex-col">
              <div className="flex gap-4">
                <img
                  src={company.logo || "/placeholder.svg?height=56&width=56"}
                  alt={company.name}
                  className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {company.name}
                      {company.verified && <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="mb-2">
                    {company.industry}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{company.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4 line-clamp-2 flex-grow">{company.description}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{company.size}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-foreground">{company.openPositions} vị trí đang tuyển</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {company.benefits.slice(0, 3).map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => handleViewDetails(company.id)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Xem chi tiết
                </Button>
                {company.website && (
                  <Button
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={() => window.open(company.website, "_blank")}
                    title="Truy cập website"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
