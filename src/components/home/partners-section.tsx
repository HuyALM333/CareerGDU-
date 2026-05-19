"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

const partnersPlaceholder = [] // Removed hardcoded array in favor of dynamic fetch

export function PartnersSection() {
  const [partners, setPartners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [spacing, setSpacing] = useState(180)

  // Cập nhật khoảng cách logo dựa trên kích thước màn hình
  useEffect(() => {
    const updateSpacing = () => {
      if (window.innerWidth < 640) setSpacing(110)
      else if (window.innerWidth < 1024) setSpacing(160)
      else setSpacing(220)
    }
    updateSpacing()
    window.addEventListener('resize', updateSpacing)
    return () => window.removeEventListener('resize', updateSpacing)
  }, [])

  // Fetch partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/companies')
        const data = await response.json()
        if (data.companies) {
          setPartners(data.companies)
        }
      } catch (error) {
        console.error("Failed to fetch partners:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [])

  // Tự động chuyển slide liên tục mỗi 3 giây
  useEffect(() => {
    if (partners.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [partners.length])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % partners.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length)
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Đồng hành cùng GDU
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Nút điều hướng trái */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border-2 border-gray-200 bg-white shadow-lg flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Logo Carousel */}
          <div className="relative h-40 md:h-48 flex items-center justify-center overflow-hidden mx-4 md:mx-16">
            {partners.map((partner, index) => {
              let position = index - currentIndex
              if (position > partners.length / 2) position -= partners.length
              if (position < -partners.length / 2) position += partners.length

              if (Math.abs(position) > 2) return null

              const isCenter = position === 0
              const isNear = Math.abs(position) === 1

              const translateX = position * spacing
              const scale = isCenter ? 1.2 : isNear ? 0.85 : 0.6
              const opacity = isCenter ? 1 : isNear ? 0.5 : 0.2
              const blur = isCenter ? 0 : 3
              const zIndex = isCenter ? 10 : isNear ? 5 : 1

              return (
                <div
                  key={partner.name}
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  <img
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    className="h-24 md:h-32 lg:h-36 w-auto object-contain drop-shadow-lg"
                    title={partner.name}
                  />
                </div>
              )
            })}
          </div>

          {/* Nút điều hướng phải */}
          <button
            onClick={handleNext}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border-2 border-gray-200 bg-white shadow-lg flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-3 mt-12">
          {partners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all duration-500 ease-out ${index === currentIndex
                ? "bg-primary w-10 shadow-md"
                : "bg-gray-300 hover:bg-primary/50 w-3"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
