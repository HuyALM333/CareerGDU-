"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, DollarSign, Clock, Building, Filter, Bookmark, Briefcase, ChevronRight, Building2, ChevronDown, GraduationCap, Calendar, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { JobPreviewPanel } from "./job-preview-panel"
import { allJobs, Job } from "@/lib/jobs-data"
import { ApplyJobDialog } from "./apply-job-dialog"

const typeLabels = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  internship: "Thực tập",
  freelance: "Freelance",
}

const typeColors = {
  "full-time": "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  "part-time": "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  internship: "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  freelance: "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
}

// Industry/Ngành nghề options
const industryOptions = [
  { id: "it", label: "Công nghệ thông tin" },
  { id: "finance", label: "Tài chính - Ngân hàng" },
  { id: "marketing", label: "Marketing - Truyền thông" },
  { id: "sales", label: "Kinh doanh - Bán hàng" },
  { id: "hr", label: "Nhân sự" },
  { id: "accounting", label: "Kế toán - Kiểm toán" },
  { id: "design", label: "Thiết kế - Đồ họa" },
  { id: "education", label: "Giáo dục - Đào tạo" },
  { id: "healthcare", label: "Y tế - Chăm sóc sức khỏe" },
  { id: "logistics", label: "Logistics - Vận tải" },
]

// Experience/Kinh nghiệm options
const experienceOptions = [
  { id: "no-exp", label: "Chưa có kinh nghiệm" },
  { id: "under-1", label: "Dưới 1 năm" },
  { id: "1-2", label: "1 - 2 năm" },
  { id: "2-5", label: "2 - 5 năm" },
  { id: "5-10", label: "5 - 10 năm" },
  { id: "above-10", label: "Trên 10 năm" },
]

// Education/Học vấn options
const educationOptions = [
  { id: "high-school", label: "Trung học phổ thông" },
  { id: "college", label: "Cao đẳng" },
  { id: "bachelor", label: "Đại học" },
  { id: "master", label: "Thạc sĩ" },
  { id: "phd", label: "Tiến sĩ" },
]

// Posted date/Đăng trong options
const postedDateOptions = [
  { id: "today", label: "Hôm nay" },
  { id: "3-days", label: "3 ngày qua" },
  { id: "7-days", label: "7 ngày qua" },
  { id: "14-days", label: "14 ngày qua" },
  { id: "30-days", label: "30 ngày qua" },
]

// Location/Địa điểm options
const locationOptions = [
  { id: "hcm", label: "TP. Hồ Chí Minh" },
  { id: "hanoi", label: "Hà Nội" },
  { id: "danang", label: "Đà Nẵng" },
  { id: "binh-duong", label: "Bình Dương" },
  { id: "dong-nai", label: "Đồng Nai" },
  { id: "can-tho", label: "Cần Thơ" },
  { id: "hai-phong", label: "Hải Phòng" },
  { id: "other", label: "Tỉnh/Thành khác" },
]

// Advanced salary ranges for horizontal filter
const advancedSalaryRanges = [
  { id: "under-5", label: "Dưới 5 triệu" },
  { id: "5-10", label: "5 - 10 triệu" },
  { id: "10-15", label: "10 - 15 triệu" },
  { id: "15-20", label: "15 - 20 triệu" },
  { id: "20-30", label: "20 - 30 triệu" },
  { id: "above-30", label: "Trên 30 triệu" },
  { id: "negotiate", label: "Thỏa thuận" },
]

interface JobsListClientProps {
  dbJobs?: Job[]
}

const removeAccents = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

// Helper function to format date and time in Vietnamese format
const formatDateTime = (dateVal: any): string => {
  if (!dateVal) return ""
  try {
    let date: Date
    if (typeof dateVal === 'string' && dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateVal.split('/').map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(dateVal)
    }

    if (isNaN(date.getTime())) return typeof dateVal === 'string' ? dateVal : ""
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh"
    })
  } catch {
    return typeof dateVal === 'string' ? dateVal : ""
  }
}

export function JobsListClient({ dbJobs = [] }: JobsListClientProps) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  // Controls the collapsed/expanded state of the top filter bar
  const [isTopFilterCollapsed, setIsTopFilterCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || searchParams.get("jobTitle") || "")
  const [selectedType, setSelectedType] = useState<string | null>(searchParams.get("type") || null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedSalary, setSelectedSalary] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<{
    title: string;
    company: string;
    jobId: string;
    creatorId?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyWebsite?: string;
    jobType?: string;
    quantity?: number;
    hiredCount?: number;
    deadline?: string;
  } | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Advanced filter states
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null)
  const [selectedPostedDate, setSelectedPostedDate] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync URL params to state
  useEffect(() => {
    const search = searchParams.get("search") || searchParams.get("jobTitle") || ""
    const type = searchParams.get("type") || null
    if (search !== searchQuery) setSearchQuery(search)
    if (type !== selectedType) setSelectedType(type)
  }, [searchParams])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Load saved jobs from database when user is logged in
  useEffect(() => {
    if (user?.id) {
      loadSavedJobs()
    } else {
      setSavedJobs([])
    }
  }, [user?.id])

  // Load saved filter bar state from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("jobs_top_filter_collapsed")
    if (saved) setIsTopFilterCollapsed(saved === "1")
  }, [])

  // Persist filter bar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jobs_top_filter_collapsed", isTopFilterCollapsed ? "1" : "0")
  }, [isTopFilterCollapsed])

  const loadSavedJobs = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/saved-jobs?userId=${user.id}`)
      const data = await response.json()
      if (data.success && data.jobIds) {
        setSavedJobs(data.jobIds)
      }
    } catch (error) {
      console.error("Error loading saved jobs:", error)
    }
  }

  // No more merging with JSON. Everything is in the DB now. 
  const mergedJobs = useMemo(() => {
    return dbJobs
  }, [dbJobs])

  // Get unique companies with job counts and logos
  const companies = useMemo(() => {
    const companyMap = new Map<string, { name: string; logo: string; logoFit?: "cover" | "contain"; count: number }>()
    mergedJobs.forEach(job => {
      if (companyMap.has(job.company)) {
        const existing = companyMap.get(job.company)!
        existing.count++
      } else {
        companyMap.set(job.company, { name: job.company, logo: job.logo || "", logoFit: job.logoFit, count: 1 })
      }
    })
    return Array.from(companyMap.values()).sort((a, b) => b.count - a.count)
  }, [mergedJobs])

  const checkSalaryMatch = (jobSalary: string, filterSalary: string) => {
    if (filterSalary === "negotiate") {
      return jobSalary.toLowerCase().includes("thỏa thuận")
    }

    if (jobSalary.toLowerCase().includes("thỏa thuận")) return false

    // Use higher-precision parsers already defined
    const minJob = parseMinSalary(jobSalary) / 1000000
    const maxJob = parseMaxSalary(jobSalary) / 1000000

    if (minJob === 0 && maxJob === 0) return false

    switch (filterSalary) {
      case "under-5":
        return minJob < 5
      case "5-10":
        return (minJob >= 5 && minJob < 10) || (maxJob > 5 && maxJob <= 10) || (minJob < 5 && maxJob > 10)
      case "10-15":
        return (minJob >= 10 && minJob < 15) || (maxJob > 10 && maxJob <= 15) || (minJob < 10 && maxJob > 15)
      case "15-20":
        return (minJob >= 15 && minJob < 20) || (maxJob > 15 && maxJob <= 20) || (minJob < 15 && maxJob > 20)
      case "10-20": // Sidebar range
        return (minJob >= 10 && minJob < 20) || (maxJob > 10 && maxJob <= 20) || (minJob < 10 && maxJob > 20)
      case "20-30":
        return (minJob >= 20 && minJob < 30) || (maxJob > 20 && maxJob <= 30) || (minJob < 20 && maxJob > 30)
      case "above-20": // Sidebar range
        return maxJob >= 20
      case "above-30":
        return maxJob >= 30
      default:
        return true
    }
  }

  // Helper function to safely parse date strings (handles DD/MM/YYYY and ISO)
  const parseDateHelper = (dateVal: any): Date => {
    if (!dateVal) return new Date(0)
    try {
      if (dateVal instanceof Date) return dateVal
      if (typeof dateVal === 'string') {
        if (dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateVal.split('/').map(Number)
          return new Date(year, month - 1, day)
        }
        const date = new Date(dateVal)
        return isNaN(date.getTime()) ? new Date(0) : date
      }
      const date = new Date(dateVal)
      return isNaN(date.getTime()) ? new Date(0) : date
    } catch {
      return new Date(0)
    }
  }

  // Helper function to parse minimum salary from string
  const parseMinSalary = (salaryVal: any): number => {
    if (!salaryVal || typeof salaryVal !== 'string') return 0
    const s = salaryVal.toLowerCase().trim()
    if (!s) return 0

    let value = 0
    let timeMultiplier = 1

    // Determine time multiplier (normalize to monthly)
    if (s.includes("/giờ") || s.includes("/h") || s.includes("hr")) {
      timeMultiplier = 160
    }

    // Case 1: "Triệu"
    if (s.includes("triệu")) {
      const matches = s.match(/[0-9]+([.,][0-9]+)?/g)
      if (matches && matches.length > 0) {
        // First number is usually the min
        const nums = matches.map(m => parseFloat(m.replace(',', '.')))
        value = Math.min(...nums) * 1000000
      }
    }
    // Case 2: USD
    else if (s.includes("usd") || s.includes("$")) {
      const matches = s.match(/[0-9]+([.,][0-9]+)?/g)
      if (matches && matches.length > 0) {
        const nums = matches.map(m => parseFloat(m.replace(/,/g, '')))
        value = Math.min(...nums) * 25300
      }
    }
    // Case 3: Raw VND or other numeric
    else {
      const clean = s.replace(/[.,]/g, '')
      const matches = clean.match(/\d+/g)
      if (matches && matches.length > 0) {
        const nums = matches.map(Number)
        value = Math.min(...nums)
      }
    }

    return value * timeMultiplier
  }

  // Helper function to parse maximum salary from string like "5-8 triệu", "20-35 triệu", or "40.000 - 90.000 VND/giờ"
  const parseMaxSalary = (salaryVal: any): number => {
    if (!salaryVal || typeof salaryVal !== 'string') return 0
    const s = salaryVal.toLowerCase().trim()
    if (!s) return 0

    let value = 0
    let timeMultiplier = 1

    // Determine time multiplier (normalize to monthly)
    // Assuming standard 160 working hours per month for hourly rates
    if (s.includes("/giờ") || s.includes("/h") || s.includes("hr")) {
      timeMultiplier = 160
    }

    // Case 1: "Triệu" (e.g., "10-15 triệu")
    if (s.includes("triệu")) {
      const matches = s.match(/[0-9]+([.,][0-9]+)?/g)
      if (matches) {
        // Replace comma with dot for decimal parsing if needed
        const nums = matches.map(m => parseFloat(m.replace(',', '.')))
        value = Math.max(...nums) * 1000000
      }
    }
    // Case 2: USD (e.g., "$1000", "1000 USD")
    else if (s.includes("usd") || s.includes("$")) {
      const matches = s.match(/[0-9]+([.,][0-9]+)?/g)
      if (matches) {
        // Remove commas before parsing (for thousands)
        const nums = matches.map(m => parseFloat(m.replace(/,/g, '')))
        value = Math.max(...nums) * 25300 // Approx exchange rate
      }
    }
    // Case 3: Raw VND or other numeric (e.g., "40.000 - 90.000", "5000000")
    else {
      // Remove dots and commas which might be separators
      // For VND "40.000" usually means 40,000. So removing dot results in 40000 which is correct.
      // We assume raw numbers without "triệu" suffix are in VND.
      const clean = s.replace(/[.,]/g, '')
      const matches = clean.match(/\d+/g)
      if (matches) {
        const nums = matches.map(Number)
        value = Math.max(...nums)
      }
    }

    return value * timeMultiplier
  }

  // Helper function to check if job matches industry filter
  const checkIndustryMatch = (job: Job, industry: string | null): boolean => {
    if (!industry) return true
    const industryKeywords: Record<string, string[]> = {
      "it": ["công nghệ", "it", "lập trình", "developer", "software", "phần mềm", "web", "mobile", "data", "ai", "machine learning"],
      "finance": ["tài chính", "ngân hàng", "finance", "banking", "kế toán", "accounting"],
      "marketing": ["marketing", "truyền thông", "digital", "seo", "content", "social media", "quảng cáo"],
      "sales": ["kinh doanh", "bán hàng", "sales", "business", "thương mại"],
      "hr": ["nhân sự", "hr", "human resource", "tuyển dụng", "recruitment"],
      "accounting": ["kế toán", "kiểm toán", "accounting", "audit", "thuế", "tax"],
      "design": ["thiết kế", "design", "đồ họa", "graphic", "ui", "ux", "creative"],
      "education": ["giáo dục", "đào tạo", "education", "training", "giảng viên", "teacher"],
      "healthcare": ["y tế", "sức khỏe", "healthcare", "medical", "bác sĩ", "điều dưỡng"],
      "logistics": ["logistics", "vận tải", "kho vận", "supply chain", "warehouse"],
    }
    const keywords = industryKeywords[industry] || []

    // Check exact field match first if available
    if (job.field === industry) return true

    const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase()
    return keywords.some(keyword => jobText.includes(keyword))
  }

  // Helper function to check if job matches experience filter
  const checkExperienceMatch = (job: Job, experience: string | null): boolean => {
    if (!experience) return true

    // Check structured experience field first
    if (job.experience === experience) return true

    const jobText = `${job.title} ${job.description}`.toLowerCase()

    switch (experience) {
      case "no-exp":
        return jobText.includes("không yêu cầu kinh nghiệm") ||
          jobText.includes("chưa có kinh nghiệm") ||
          jobText.includes("freshers") ||
          jobText.includes("sinh viên") ||
          job.type === "internship"
      case "under-1":
        return jobText.includes("dưới 1 năm") || jobText.includes("< 1 năm")
      case "1-2":
        return jobText.includes("1 năm") || jobText.includes("2 năm") || jobText.includes("1-2 năm")
      case "2-5":
        return jobText.includes("2-5 năm") || jobText.includes("3 năm") || jobText.includes("4 năm") || jobText.includes("5 năm")
      case "5-10":
        return jobText.includes("5-10 năm") || jobText.includes("6 năm") || jobText.includes("7 năm") || jobText.includes("8 năm")
      case "above-10":
        return jobText.includes("trên 10 năm") || jobText.includes("> 10 năm")
      default:
        return true
    }
  }

  // Helper function to check if job matches education filter
  const checkEducationMatch = (job: Job, education: string | null): boolean => {
    if (!education) return true

    // Check structured education field first
    if (job.education === education) return true

    const jobText = `${job.title} ${job.description}`.toLowerCase()

    switch (education) {
      case "high-school":
        return jobText.includes("trung học") || jobText.includes("phổ thông") || jobText.includes("12/12")
      case "college":
        return jobText.includes("cao đẳng") || jobText.includes("trung cấp")
      case "bachelor":
        return jobText.includes("đại học") || jobText.includes("cử nhân") || jobText.includes("bachelor")
      case "master":
        return jobText.includes("thạc sĩ") || jobText.includes("master")
      case "phd":
        return jobText.includes("tiến sĩ") || jobText.includes("phd") || jobText.includes("doctor")
      default:
        return true
    }
  }

  // Helper function to check if job matches posted date filter
  const checkPostedDateMatch = (job: Job, postedDate: string | null): boolean => {
    if (!postedDate) return true

    const now = new Date()
    const jobDate = new Date(job.postedAt)
    const diffDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))

    switch (postedDate) {
      case "today":
        return diffDays === 0
      case "3-days":
        return diffDays <= 3
      case "7-days":
        return diffDays <= 7
      case "14-days":
        return diffDays <= 14
      case "30-days":
        return diffDays <= 30
      default:
        return true
    }
  }

  // Helper function to check if job matches location filter
  const checkLocationMatch = (job: Job, location: string | null): boolean => {
    if (!location) return true
    const jobLocation = job.location.toLowerCase()
    const filterValue = location.toLowerCase()

    switch (location) {
      case "hcm":
        return jobLocation.includes("hồ chí minh") || jobLocation.includes("hcm") || jobLocation.includes("tp.hcm") || jobLocation.includes("sài gòn")
      case "hanoi":
        return jobLocation.includes("hà nội") || jobLocation.includes("hanoi")
      case "danang":
        return jobLocation.includes("đà nẵng") || jobLocation.includes("da nang")
      case "binh-duong":
        return jobLocation.includes("bình dương")
      case "dong-nai":
        return jobLocation.includes("đồng nai")
      case "can-tho":
        return jobLocation.includes("cần thơ")
      case "hai-phong":
        return jobLocation.includes("hải phòng")
      case "other":
        return !["hồ chí minh", "hcm", "tp.hcm", "sài gòn", "hà nội", "hanoi", "đà nẵng", "da nang", "bình dương", "đồng nai", "cần thơ", "hải phòng"]
          .some(city => jobLocation.includes(city))
      default:
        return jobLocation.includes(filterValue)
    }
  }

  const filteredJobs = mergedJobs.filter((job) => {
    const normalizedQuery = removeAccents(searchQuery)
    const matchesSearch = !searchQuery || [
      job.title,
      job.company,
      job.description,
      job.location,
      job.field,
      typeLabels[job.type as keyof typeof typeLabels],
      ...(job.skills || [])
    ].some(field => field && removeAccents(field).includes(normalizedQuery))

    const matchesType = !selectedType || job.type === selectedType
    const matchesCompany = !selectedCompany || job.company === selectedCompany
    const matchesSalary = !selectedSalary || checkSalaryMatch(job.salary, selectedSalary)

    // Apply advanced filters
    const matchesIndustry = checkIndustryMatch(job, selectedIndustry)
    const matchesExperience = checkExperienceMatch(job, selectedExperience)
    const matchesEducation = checkEducationMatch(job, selectedEducation)
    const matchesPostedDate = checkPostedDateMatch(job, selectedPostedDate)
    const matchesLocation = checkLocationMatch(job, selectedLocation)

    return matchesSearch && matchesType && matchesCompany && matchesSalary &&
      matchesIndustry && matchesExperience && matchesEducation && matchesPostedDate && matchesLocation
  })

  // Apply sorting based on selected sort option
  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs]

    switch (sortBy) {
      case "newest":
        return jobs.sort((a, b) => new Date((b as any).publishAt || b.postedAt).getTime() - new Date((a as any).publishAt || a.postedAt).getTime())
      case "salary":
        return jobs.sort((a, b) => {
          const maxA = parseMaxSalary(a.salary)
          const maxB = parseMaxSalary(b.salary)
          if (maxA !== maxB) {
            return maxB - maxA // Sort by max salary descending
          }
          // If max salaries are equal, sort by min salary descending
          const minA = parseMinSalary(a.salary)
          const minB = parseMinSalary(b.salary)
          return minB - minA
        })
      case "deadline":
      // Sort by deadline, soonest first
      case "deadline":
        // Sort by deadline, soonest first (and process valid deadlines only or push invalid to end)
        return jobs.sort((a, b) => {
          const timeA = parseDateHelper(a.deadline).getTime()
          const timeB = parseDateHelper(b.deadline).getTime()

          // Push jobs with no deadline to the bottom
          if (!timeA && !timeB) return 0
          if (!timeA) return 1
          if (!timeB) return -1

          return timeA - timeB
        })
      default:
        return jobs
    }
  }, [filteredJobs, sortBy])

  // Simple helper for deadline display (no time needed)
  const formatDeadline = (dateVal: any): string => {
    if (!dateVal) return ""
    try {
      let date: Date
      if (typeof dateVal === 'string' && dateVal.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateVal.split('/').map(Number)
        date = new Date(year, month - 1, day)
      } else {
        date = new Date(dateVal)
      }

      if (isNaN(date.getTime())) return typeof dateVal === 'string' ? dateVal : ""
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    } catch {
      return typeof dateVal === 'string' ? dateVal : ""
    }
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(prev => prev === type ? null : type)
  }

  const handleSalaryChange = (salary: string) => {
    setSelectedSalary(prev => prev === salary ? null : salary)
  }

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(prev => prev === company ? null : company)
  }

  const handleApply = (jobId: string, jobTitle: string, company: string, creatorId?: string, email?: string, phone?: string, website?: string, jobType?: string, quantity?: number, hiredCount?: number, deadline?: string) => {
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname + window.location.search)
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
      jobType: jobType,
      quantity: quantity,
      hiredCount: hiredCount,
      deadline: deadline
    })
    setIsApplyDialogOpen(true)
  }

  const handleSave = async (jobId: string, jobTitle: string) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để lưu việc làm",
        variant: "destructive",
      })
      return
    }

    if (user.role === "employer" || user.role === "admin") {
      toast({
        title: "Không khả dụng",
        description: "Tính năng lưu việc làm chỉ dành cho ứng viên",
        variant: "destructive",
      })
      return
    }

    try {
      // Optimistic update
      const isSaved = savedJobs.includes(jobId)
      if (isSaved) {
        setSavedJobs(savedJobs.filter((id) => id !== jobId))
      } else {
        setSavedJobs([...savedJobs, jobId])
      }

      const job = mergedJobs.find(j => j._id === jobId)

      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          jobId,
          jobData: {
            title: jobTitle,
            company: job?.company || "",
            logo: job?.logo || "",
            location: job?.location || "",
            salary: job?.salary || "",
            deadline: job?.deadline || "",
            type: job?.type || ""
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: data.saved ? "Đã lưu!" : "Đã bỏ lưu",
          description: data.saved
            ? `Đã lưu ${jobTitle} vào danh sách của bạn`
            : `Đã xóa ${jobTitle} khỏi danh sách lưu`,
        })
      } else {
        // Revert optimistic update on error
        if (isSaved) {
          setSavedJobs([...savedJobs, jobId])
        } else {
          setSavedJobs(savedJobs.filter((id) => id !== jobId))
        }
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu việc làm. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType(null)
    setSelectedCompany(null)
    setSelectedSalary(null)
    setSelectedIndustry(null)
    setSelectedExperience(null)
    setSelectedEducation(null)
    setSelectedPostedDate(null)
    setSelectedLocation(null)
  }

  const clearAdvancedFilters = () => {
    setSelectedIndustry(null)
    setSelectedExperience(null)
    setSelectedEducation(null)
    setSelectedPostedDate(null)
    setSelectedLocation(null)
  }

  const hasActiveFilters = searchQuery || selectedType || selectedCompany || selectedSalary
  const hasAdvancedFilters = selectedIndustry || selectedExperience || selectedEducation || selectedPostedDate || selectedLocation
  const advancedFilterCount = [selectedIndustry, selectedExperience, selectedEducation, selectedPostedDate, selectedLocation].filter(Boolean).length

  // State for collapsible sidebar sections - default to collapsed as requested
  const [expandedSections, setExpandedSections] = useState({
    company: false,
    type: false,
    salary: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // FilterDropdown component
  const FilterDropdown = ({
    label,
    options,
    value,
    onChange,
    icon: Icon,
    dropdownId,
    searchable = false
  }: {
    label: string
    options: { id: string; label: string }[]
    value: string | null
    onChange: (value: string | null) => void
    icon?: React.ComponentType<{ className?: string }>
    dropdownId: string
    searchable?: boolean
  }) => {
    const [localSearch, setLocalSearch] = useState("")
    const isOpen = activeDropdown === dropdownId

    // Filter options based on local search query
    const filteredOptions = useMemo(() => {
      if (!searchable || !localSearch) return options
      const query = localSearch.toLowerCase().trim()
      return options.filter(opt => opt.label.toLowerCase().includes(query))
    }, [options, searchable, localSearch])

    const selectedOption = options.find(opt => opt.id === value)

    // Reset local search when dropdown closes
    useEffect(() => {
      if (!isOpen) {
        setLocalSearch("")
      }
    }, [isOpen])

    return (
      <div className="relative">
        {/* Desktop View: Absolute Dropdown */}
        <div className="hidden lg:block">
          <button
            onClick={() => setActiveDropdown(isOpen ? null : dropdownId)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-full border transition-all shadow-sm ${value
              ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 text-primary font-medium"
              : "bg-white border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-gray-50/80 hover:shadow-md"
              }`}
          >
            {Icon && <Icon className={`h-4 w-4 ${value ? "text-primary" : "text-gray-400"}`} />}
            <span className="whitespace-nowrap">{selectedOption ? selectedOption.label : label}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${value ? "text-primary" : "text-gray-400"}`} />
          </button>

          {isOpen && (
            <>
              {/* Dropdown Triangle Arrow */}
              <div className="absolute top-full left-6 mt-1.5 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45 z-[51]" />

              <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300 overflow-hidden">
                {/* Header Section */}
                <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Lọc theo</span>
                    <span className="text-sm font-black text-gray-800 tracking-tight">{label}</span>
                  </div>
                  {value && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onChange(null)
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md transition-colors"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>

                {/* Search Input Section - Isolated */}
                {searchable && (
                  <div className="px-4 py-4 bg-white">
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors font-bold" />
                      <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (filteredOptions.length > 0) {
                              onChange(filteredOptions[0].id)
                              setActiveDropdown(null)
                            } else if (localSearch.trim()) {
                              onChange(localSearch.trim())
                              setActiveDropdown(null)
                            }
                          }
                        }}
                        placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all font-medium placeholder:text-gray-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                  {filteredOptions.length > 0 ? (
                    <div className="px-2 space-y-0.5">
                      {filteredOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            onChange(option.id)
                            setActiveDropdown(null)
                          }}
                          className={`w-full px-3 py-3 text-left text-sm rounded-xl flex items-center gap-3 transition-all ${value === option.id
                            ? "bg-primary/5 text-primary font-bold shadow-sm ring-1 ring-primary/10"
                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === option.id
                            ? "border-primary bg-primary scale-110 shadow-lg shadow-primary/20"
                            : "border-gray-200 bg-white"
                            }`}>
                            {value === option.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-0 duration-300" />}
                          </div>
                          <span className="flex-1 truncate">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : localSearch.trim() ? (
                    <div className="px-4 py-2">
                      <button
                        onClick={() => {
                          onChange(localSearch.trim())
                          setActiveDropdown(null)
                        }}
                        className="w-full px-4 py-3 text-left text-sm bg-primary/5 rounded-xl border border-dashed border-primary/30 flex items-center gap-3 transition-colors text-primary font-bold hover:bg-primary/10"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        Dùng: "{localSearch.trim()}"
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Không tìm thấy kết quả</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile View: Bottom Sheet */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-full border transition-all shadow-sm ${value
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-gray-600"
                  }`}
              >
                {Icon && <Icon className={`h-3.5 w-3.5 ${value ? "text-white" : "text-gray-400"}`} />}
                <span className="whitespace-nowrap">{selectedOption ? selectedOption.label : label}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${value ? "text-white" : "text-gray-400"}`} />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-10">
              <SheetHeader className="px-6 mb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-bold">{label}</SheetTitle>
                  {value && (
                    <button
                      onClick={() => onChange(null)}
                      className="text-sm text-red-500 font-medium"
                    >
                      Xóa chọn
                    </button>
                  )}
                </div>
              </SheetHeader>
              <div className="max-h-[60vh] overflow-y-auto px-2">
                <div className="grid grid-cols-1 gap-1">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onChange(option.id)}
                      className={`w-full px-4 py-4 text-left rounded-xl flex items-center justify-between transition-colors ${value === option.id
                        ? "bg-primary/5 text-primary font-bold border border-primary/20"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {value === option.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }

  const salaryRanges = [
    { id: "under-5", label: "Dưới 5 triệu" },
    { id: "5-10", label: "5 - 10 triệu" },
    { id: "10-20", label: "10 - 20 triệu" },
    { id: "above-20", label: "Trên 20 triệu" },
    { id: "negotiate", label: "Thỏa thuận" },
  ]

  return (
    <div className="space-y-6">
      {/* Horizontal Filter Bar - STICKY */}
      <div ref={dropdownRef} className="bg-white/95 backdrop-blur-md sticky top-[112px] lg:top-[128px] z-40 border-b border-gray-100 py-2.5 lg:py-4 mb-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3">
            {/* Row 1: Filter Options */}
            {!isTopFilterCollapsed && (
              <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <FilterDropdown
                  label="Ngành nghề"
                  options={industryOptions}
                  value={selectedIndustry}
                  onChange={setSelectedIndustry}
                  icon={Briefcase}
                  dropdownId="industry"
                />
                <FilterDropdown
                  label="Kinh nghiệm"
                  options={experienceOptions}
                  value={selectedExperience}
                  onChange={setSelectedExperience}
                  icon={Clock}
                  dropdownId="experience"
                />
                <FilterDropdown
                  label="Mức lương"
                  options={advancedSalaryRanges}
                  value={selectedSalary}
                  onChange={setSelectedSalary}
                  icon={DollarSign}
                  dropdownId="salary"
                />
                <FilterDropdown
                  label="Học vấn"
                  options={educationOptions}
                  value={selectedEducation}
                  onChange={setSelectedEducation}
                  icon={GraduationCap}
                  dropdownId="education"
                />
                <FilterDropdown
                  label="Loại việc"
                  options={Object.entries(typeLabels).map(([id, label]) => ({ id, label }))}
                  value={selectedType}
                  onChange={setSelectedType}
                  icon={Building}
                  dropdownId="type"
                />
                <FilterDropdown
                  label="Đăng trong"
                  options={postedDateOptions}
                  value={selectedPostedDate}
                  onChange={setSelectedPostedDate}
                  icon={Calendar}
                  dropdownId="posted"
                />
                <FilterDropdown
                  label="Địa điểm"
                  options={locationOptions}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  icon={MapPin}
                  dropdownId="location"
                  searchable={true}
                />

                {(hasAdvancedFilters || selectedSalary || selectedType) && (
                  <button
                    onClick={() => {
                      clearAdvancedFilters()
                      setSelectedSalary(null)
                      setSelectedType(null)
                    }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-all border border-red-100"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Xóa lọc</span>
                  </button>
                )}
              </div>
            )}

            {/* Row 2: Search + Collapse button */}
            <div className="w-full lg:w-[680px] flex items-center gap-2">
              {/* Search input */}
              <div className="relative group flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors font-bold" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm nhanh tên công việc, công ty..."
                  className="w-full pl-12 pr-10 py-2 text-sm lg:text-base bg-gray-50/50 border border-gray-100 rounded-2xl
                 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white
                 transition-all font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Collapse toggle */}
              <button
                onClick={() => setIsTopFilterCollapsed(v => !v)}
                className="h-10 px-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm
               text-gray-700 font-bold text-sm flex items-center gap-2 transition-all"
                aria-label={isTopFilterCollapsed ? "Mở bộ lọc" : "Thu gọn bộ lọc"}
                title={isTopFilterCollapsed ? "Mở bộ lọc" : "Thu gọn bộ lọc"}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isTopFilterCollapsed ? "Mở lọc" : "Thu gọn"}
                </span>
              </button>
            </div>
            {isTopFilterCollapsed && (hasAdvancedFilters || selectedSalary || selectedType) && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  Đang lọc: {advancedFilterCount + (selectedSalary ? 1 : 0) + (selectedType ? 1 : 0)}
                </span>
                <button
                  onClick={() => {
                    clearAdvancedFilters()
                    setSelectedSalary(null)
                    setSelectedType(null)
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="hidden lg:block sticky top-[200px] space-y-6">
            <Card className="border-none shadow-sm bg-white max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Bộ lọc tìm kiếm
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Từ khóa</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Chức danh, kỹ năng..."
                          className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 border-input"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Company Filter */}
                    <div>
                      <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('company')}>
                        <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          Doanh nghiệp
                        </Label>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedSections.company ? "rotate-180" : ""}`} />
                      </div>
                      {expandedSections.company && (
                        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200">
                          {companies.map((company) => (
                            <div
                              key={company.name}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedCompany === company.name
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-gray-50 border border-transparent"
                                }`}
                              onClick={() => handleCompanyChange(company.name)}
                            >
                              <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {company.logo ? (
                                  <img src={company.logo} alt={company.name} className={`w-full h-full ${company.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                                ) : (
                                  <Building className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm truncate block ${selectedCompany === company.name ? "font-semibold text-primary" : "font-medium"}`}>
                                  {company.name}
                                </span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCompany === company.name
                                ? "bg-primary text-white"
                                : "text-muted-foreground bg-gray-100"
                                }`}>
                                {company.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Work Type Filter */}
                    <div>
                      <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('type')}>
                        <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                          <Briefcase className="h-4 w-4" />
                          Hình thức làm việc
                        </Label>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedSections.type ? "rotate-180" : ""}`} />
                      </div>
                      {expandedSections.type && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {Object.entries(typeLabels).map(([value, label]) => (
                            <div
                              key={value}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedType === value
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-gray-50 border border-transparent"
                                }`}
                              onClick={() => handleTypeChange(value)}
                            >
                              <span className={`text-sm block flex-1 ${selectedType === value ? "font-semibold text-primary" : "font-medium"}`}>
                                {label}
                              </span>
                              {selectedType === value && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Salary Filter */}
                    <div>
                      <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => toggleSection('salary')}>
                        <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                          <DollarSign className="h-4 w-4" />
                          Mức lương
                        </Label>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedSections.salary ? "rotate-180" : ""}`} />
                      </div>
                      {expandedSections.salary && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {salaryRanges.map((range) => (
                            <div
                              key={range.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedSalary === range.id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-gray-50 border border-transparent"
                                }`}
                              onClick={() => handleSalaryChange(range.id)}
                            >
                              <span className={`text-sm block flex-1 ${selectedSalary === range.id ? "font-semibold text-primary" : "font-medium"}`}>
                                {range.label}
                              </span>
                              {selectedSalary === range.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Việc làm nổi bật <span className="text-muted-foreground font-normal text-base ml-2">({sortedJobs.length})</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-medium text-foreground focus:ring-0 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao nhất</option>
                <option value="deadline">Hạn nộp hồ sơ</option>
              </select>
            </div>
          </div>


          <div className="space-y-4">
            {sortedJobs.map((job) => (
              <Card
                key={job._id}
                className={`group hover:border-primary/50 transition-all duration-300 bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer ${hoveredJob?._id === job._id ? "border-primary ring-1 ring-primary/20" : ""}`}
                onClick={() => router.push(`/jobs/${job._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-lg border border-gray-100 bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} className={`w-full h-full ${job.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    {/* Content */}
                    <div
                      className="flex-1 min-w-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                        <div>
                          {(() => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const expiredAtRaw = (job as any).expiredAt
                            const expiredAt = expiredAtRaw ? new Date(expiredAtRaw) : null
                            if (expiredAt) expiredAt.setHours(0, 0, 0, 0)
                            const deadlineDate = parseDateHelper(job.deadline)
                            deadlineDate.setHours(0, 0, 0, 0)

                            const isExpired = (expiredAt && expiredAt < today) || (!!job.deadline && deadlineDate.getTime() > 0 && deadlineDate < today)
                            const isFull = job.quantity !== undefined && job.quantity !== -1 && (job.hiredCount || 0) >= (job.quantity || 1)

                            return (isExpired || isFull) ? (
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {isExpired && (
                                  <Badge variant="destructive" className="text-xs">Hết hạn</Badge>
                                )}
                                {isFull && (
                                  <Badge variant="secondary" className="text-xs">Đã tuyển đủ</Badge>
                                )}
                              </div>
                            ) : null
                          })()}
                          <div
                            className="relative inline-block"
                            onMouseEnter={() => {
                              if (timeoutRef.current) clearTimeout(timeoutRef.current)
                              setHoveredJob(job)
                            }}
                            onMouseLeave={() => {
                              timeoutRef.current = setTimeout(() => {
                                setHoveredJob(null)
                              }, 300)
                            }}
                          >
                            <h3 className="text-lg font-bold text-gray-900 hover:text-[#1e3a5f] transition-colors mb-1 w-fit cursor-pointer border-b border-transparent hover:border-gray-300">
                              {job.title}
                            </h3>

                            {/* Quick View Popover */}
                            {hoveredJob?._id === job._id && (
                              <div className="absolute top-full left-0 z-50 mt-2 w-[450px] md:w-[600px] shadow-2xl rounded-xl border border-gray-200 bg-white animate-in fade-in zoom-in-95 duration-200">
                                <JobPreviewPanel
                                  job={job}
                                  onApply={(job) => handleApply(job._id, job.title, job.company, job.creatorId, job.contactEmail, job.contactPhone, job.website, job.type, job.quantity, job.hiredCount, job.deadline)}
                                  onSave={(job) => handleSave(job._id, job.title)}
                                  isSaved={savedJobs.includes(job._id)}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium w-fit mt-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary" className={typeColors[job.type as keyof typeof typeColors]}>
                            {typeLabels[job.type as keyof typeof typeLabels]}
                          </Badge>
                          <span className="text-[13px] text-gray-400 font-medium italic whitespace-nowrap">
                            Đăng lúc: {formatDateTime(job.postedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mb-4 w-fit">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-green-600 font-medium">{job.salary}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${(() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const expiredAtRaw = (job as any).expiredAt
                          const expiredAt = expiredAtRaw ? new Date(expiredAtRaw) : null
                          if (expiredAt) expiredAt.setHours(0, 0, 0, 0)
                          return (expiredAt && expiredAt < today) || (job.deadline && parseDateHelper(job.deadline).getTime() > 0 && parseDateHelper(job.deadline) < today)
                        })() ? "text-red-500 font-bold" : ""}`}>
                          <Clock className="h-4 w-4" />
                          {job.deadline ? (
                            (() => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const dDate = parseDateHelper(job.deadline)
                              dDate.setHours(0, 0, 0, 0)
                              return dDate.getTime() > 0 && dDate < today
                            })() ?
                              `Hết hạn: ${formatDeadline(job.deadline)}` :
                              `Hạn: ${formatDeadline(job.deadline)}`
                          ) : "Vô thời hạn"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {!(user?.role === "employer" || user?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-primary hover:bg-transparent -ml-2 font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSave(job._id, job.title)
                            }}
                          >
                            <Bookmark className={`h-5 w-5 mr-2 ${savedJobs.includes(job._id) ? "fill-primary text-primary" : ""}`} />
                            {savedJobs.includes(job._id) ? "Đã lưu" : "Lưu tin"}
                          </Button>
                        )}
                        {(() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const expiredAtRaw = (job as any).expiredAt
                          const expiredAt = expiredAtRaw ? new Date(expiredAtRaw) : null
                          if (expiredAt) expiredAt.setHours(0, 0, 0, 0)
                          const dDate = parseDateHelper(job.deadline)
                          dDate.setHours(0, 0, 0, 0)
                          const isExpired = (expiredAt && expiredAt < today) || (!!job.deadline && dDate.getTime() > 0 && dDate < today)
                          const isFull = job.quantity !== undefined && job.quantity !== -1 && (job.hiredCount || 0) >= (job.quantity || 1)

                          if (isFull) return null

                          return (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (user?.role === "employer" || user?.role === "admin") return
                                handleApply(job._id, job.title, job.company, job.creatorId, job.contactEmail, job.contactPhone, job.website, job.type, job.quantity, job.hiredCount, job.deadline)
                              }}
                              disabled={(user?.role === "employer" || user?.role === "admin") || isExpired}
                              className={`shadow-sm px-6 ml-auto ${(user?.role === "employer" || user?.role === "admin" || isExpired) ? "bg-gray-100 text-gray-400 hover:bg-gray-100" : "bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"}`}
                            >
                              {isExpired
                                ? "Hết hạn"
                                : (user?.role === "employer" || user?.role === "admin")
                                  ? "Chỉ dành cho ứng viên"
                                  : "Ứng tuyển ngay"}
                              {!(user?.role === "employer" || user?.role === "admin") && !isExpired && <ChevronRight className="h-4 w-4 ml-1" />}
                            </Button>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sortedJobs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
                <p className="text-gray-500">Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
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
        quantity={selectedJob?.quantity}
        hiredCount={selectedJob?.hiredCount}
        deadline={selectedJob?.deadline}
      />
    </div>
  )
}
