import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedJobs } from "@/components/home/featured-jobs"
import { MajorsSection } from "@/components/home/majors-section"
import { StatsSection } from "@/components/home/stats-section"
import { PartnersSection } from "@/components/home/partners-section"
import { MarketTrends } from "@/components/home/market-trends"
import { getHeroSlides, getLatestJobs, getSiteConfig } from "@/lib/data-service"

export default async function HomePage() {
  const [slides, jobs, featuredJobsConfig] = await Promise.all([
    getHeroSlides("home"),
    getLatestJobs(4),
    getSiteConfig("home_featured_jobs")
  ])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <HeroSection initialSlides={slides as any} />
        <div className="mt-12">
          <FeaturedJobs initialJobs={jobs as any} initialConfig={featuredJobsConfig as any} />
        </div>
        <MarketTrends />
        <MajorsSection />
        <StatsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  )
}
