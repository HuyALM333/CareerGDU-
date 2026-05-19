export interface User {
  _id: string
  id?: string
  email: string
  name: string
  role: "student" | "employer" | "admin"
  avatar?: string
  phone?: string
  studentId?: string
  major?: string
  faculty?: string
  cohort?: string
  createdAt: Date
  updatedAt: Date
  // Company fields
  companyName?: string
  website?: string
  address?: string
  description?: string
  size?: string
  notificationSettings?: {
    email: boolean
    push: boolean
    newJobs: boolean
  }
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "internship" | "freelance"
  salary: string
  description: string
  requirements: string[]
  benefits: string[]
  postedBy: string
  createdAt: Date
  deadline: Date
  applicants: number
  status: "pending" | "scheduled" | "published" | "rejected" | "expired" | "closed" | "draft"
  postedAt?: string | Date
  publishAt?: string | Date
  approvedAt?: string | Date
  expiredAt?: string | Date
}

export interface GoogleReview {
  id: string
  author: string
  rating: number
  content: string
  date: Date
  profilePhoto?: string
  likes: number
}

export interface DailyUpdate {
  id: string
  userId: string
  content: string
  type: "job" | "event" | "announcement"
  createdAt: Date
  views: number
}

export interface News {
  _id?: string
  id?: string
  title: string
  slug: string
  summary: string
  content: string
  imageUrl?: string
  gallery?: string[]
  videoUrl?: string
  videoUrls?: string[]
  relatedLinks?: { title: string; url: string }[]
  sourceName: string
  sourceUrl: string
  category: string
  publishedAt: string | Date
  views: number
  isFeatured?: boolean
  tags?: string[]
  readingTime?: string
}
