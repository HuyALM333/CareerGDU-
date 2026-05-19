import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import fs from "fs"
import path from "path"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: applicationId } = await params
        console.log(`[CV API] Serving CV for application: ${applicationId}`)

        const applicationRaw = await prisma.application.findUnique({
            where: { id: applicationId }
        })
        const application = applicationRaw as any

        if (!application) {
            console.warn(`[CV API] Application not found: ${applicationId}`)
            return new Response("Application not found", { status: 404 })
        }

        if (!application.cvBase64) {
            console.warn(`[CV API] CV file not found for application: ${applicationId}`)
            return new Response("CV file not found for this application", { status: 404 })
        }

        let buffer: Buffer
        let contentType = application.cvType || "application/pdf"

        if (application.cvBase64.startsWith("/uploads/")) {
            // Case: Local filesystem storage
            const filePath = path.join(process.cwd(), "public", application.cvBase64)
            if (!fs.existsSync(filePath)) {
                return new Response("File not found on server", { status: 404 })
            }
            buffer = fs.readFileSync(filePath)
        } else {
            // Backward compatibility for legacy Base64 data
            const matches = application.cvBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            if (!matches || matches.length !== 3) {
                return new Response("Invalid CV file format", { status: 500 })
            }
            contentType = matches[1]
            buffer = Buffer.from(matches[2], 'base64')
        }

        const filename = application.cvOriginalName || 'cv.pdf'
        const encodedFilename = encodeURIComponent(filename)

        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
                "Content-Length": buffer.length.toString(),
            },
        })
    } catch (error: any) {
        console.error("[CV API] CRITICAL ERROR serving CV:", error)
        return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 })
    }
}


