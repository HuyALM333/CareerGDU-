import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        // Check if running on Vercel (serverless)
        const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV

        if (isVercel) {
            // On Vercel, we can't run Python scripts
            // Instead, read the pre-processed data from public folder
            const url = new URL(request.url)
            const baseUrl = `${url.protocol}//${url.host}`

            const statsResponse = await fetch(`${baseUrl}/data/reviews-stats.json`)
            const reviewsResponse = await fetch(`${baseUrl}/data/reviews.json`)

            if (statsResponse.ok && reviewsResponse.ok) {
                const stats = await statsResponse.json()
                const reviews = await reviewsResponse.json()

                return NextResponse.json({
                    success: true,
                    message: "Dữ liệu đã được tải từ file JSON đã xử lý trước đó.",
                    stats: {
                        ...stats,
                        total_reviews: reviews.length,
                    },
                    isPreProcessed: true,
                })
            }

            return NextResponse.json({
                success: false,
                error: "Không tìm thấy dữ liệu. Vui lòng chạy script Python trên máy local và push lên GitHub.",
                isVercel: true,
            }, { status: 400 })
        }

        // Local environment - can run Python script
        const { exec } = await import("child_process")
        const { promisify } = await import("util")
        const { existsSync } = await import("fs")
        const { join } = await import("path")

        const execAsync = promisify(exec)
        const scriptPath = join(process.cwd(), "scripts", "process_reviews_json.py")

        if (!existsSync(scriptPath)) {
            return NextResponse.json({
                success: false,
                error: "Python script not found: scripts/process_reviews_json.py",
            }, { status: 404 })
        }

        // Execute Python script
        const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
            cwd: process.cwd(),
        })

        if (stderr && !stderr.includes("✓")) {
            console.error("[v0] Python script stderr:", stderr)
        }

        console.log("[v0] Python script output:", stdout)

        // Read the generated stats file to return to frontend
        const statsPath = join(process.cwd(), "public", "data", "reviews-stats.json")
        const { readFileSync } = await import("fs")

        if (existsSync(statsPath)) {
            const statsContent = readFileSync(statsPath, "utf-8")
            const stats = JSON.parse(statsContent)

            return NextResponse.json({
                success: true,
                message: "Dữ liệu JSON đã được xử lý thành công bằng Python script.",
                stats,
                output: stdout,
            })
        }

        return NextResponse.json({
            success: true,
            message: "Script đã chạy nhưng không tìm thấy file stats.",
            output: stdout,
        })

    } catch (error: any) {
        console.error("[v0] Error running Python script:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to process JSON data",
            details: error.stderr || error.stdout || "",
        }, { status: 500 })
    }
}
