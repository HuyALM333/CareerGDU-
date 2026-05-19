import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { url } = await req.json()
        if (!url) {
            return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            return NextResponse.json({ success: false, error: "Failed to fetch URL" }, { status: 500 })
        }

        const html = await response.text()

        // Simple regex-based extraction
        const getMetaTag = (html: string, name: string) => {
            // Regex to find content from meta tags with property or name, regardless of attribute order
            const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, 'i')
            const match = html.match(regex)
            return match ? (match[1] || match[2]) : null
        }

        const getTitle = (html: string) => {
            const titleMatch = html.match(/<title>(.*?)<\/title>/i)
            return titleMatch ? titleMatch[1] : null
        }

        const metadata = {
            title: getMetaTag(html, "og:title") || getMetaTag(html, "twitter:title") || getTitle(html) || "",
            description: getMetaTag(html, "og:description") || getMetaTag(html, "twitter:description") || getMetaTag(html, "description") || "",
            image: getMetaTag(html, "og:image") || getMetaTag(html, "twitter:image") || "",
            sourceName: new URL(url).hostname.replace("www.", ""),
        }

        // Clean up title (remove site name suffixes often added by sites)
        if (metadata.title) {
            metadata.title = metadata.title.split(' - ')[0].split(' | ')[0].trim()
        }

        return NextResponse.json({
            success: true,
            data: metadata
        })
    } catch (error) {
        console.error("Metadata extraction error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to extract metadata" },
            { status: 500 }
        )
    }
}
