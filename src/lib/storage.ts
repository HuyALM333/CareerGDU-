import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

/**
 * Lưu chuỗi Base64 thành tệp tin trong thư mục public/uploads
 * @param base64 Chuỗi base64 (có hoặc không có tiền tố data:image...)
 * @param subDir Thư mục con (ví dụ: 'avatars', 'slides', 'logos')
 * @returns URL để truy cập tệp tin (ví dụ: '/uploads/avatars/abc.png')
 */
export async function saveBase64Image(base64: string, subDir: string): Promise<string | null> {
    if (!base64 || !base64.startsWith("data:")) {
        return base64 // nếu là URL sẵn thì giữ nguyên
    }

    try {
        // ✅ FIX: regex support mọi mime type
        const matches = base64.match(/^data:(.+);base64,(.+)$/)

        if (!matches || matches.length !== 3) {
            throw new Error("Invalid base64 format")
        }

        const mimeType = matches[1]
        const base64Data = matches[2]

        const buffer = Buffer.from(base64Data, "base64")

        // ✅ FIX: map extension chuẩn
        let extension = "bin"

        if (mimeType.includes("pdf")) extension = "pdf"
        else if (mimeType.includes("msword")) extension = "doc"
        else if (mimeType.includes("officedocument")) extension = "docx"
        else if (mimeType.includes("image")) extension = mimeType.split("/")[1]
        else extension = mimeType.split("/")[1] || "bin"

        const fileName = `${uuidv4()}.${extension}`

        const uploadDir = path.join(process.cwd(), "public", "uploads", subDir)

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, fileName)

        fs.writeFileSync(filePath, buffer)

        return `/uploads/${subDir}/${fileName}`
    } catch (error) {
        console.error("[Storage] Error saving base64:", error)

        // ❌ QUAN TRỌNG: KHÔNG return base64 nữa
        return null
    }
}

/**
 * Lưu đối tượng File vào Local Storage
 * @param file Đối tượng File từ Upload
 * @param subDir Thư mục con
 * @returns URL truy cập
 */
export async function saveFile(file: File, subDir: string): Promise<string> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const extension = path.extname(file.name) || ".bin"
        const fileName = `${uuidv4()}${extension}`
        const uploadDir = path.join(process.cwd(), "public", "uploads", subDir)

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, fileName)
        fs.writeFileSync(filePath, buffer)

        return `/uploads/${subDir}/${fileName}`
    } catch (error) {
        console.error("[Storage] Error saving file:", error)
        throw error
    }
}
