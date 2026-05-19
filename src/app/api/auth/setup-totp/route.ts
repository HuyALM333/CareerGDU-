import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import crypto from "crypto"
import QRCode from "qrcode"

// Base32 encoding for TOTP secret
function base32Encode(buffer: Buffer): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    let bits = ""
    let result = ""

    for (const byte of buffer) {
        bits += byte.toString(2).padStart(8, "0")
    }

    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, "0")
        result += alphabet[parseInt(chunk, 2)]
    }

    return result
}

// Base32 decoding for TOTP verification
function base32Decode(encoded: string): Buffer {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    let bits = ""

    for (const char of encoded.toUpperCase()) {
        const index = alphabet.indexOf(char)
        if (index >= 0) {
            bits += index.toString(2).padStart(5, "0")
        }
    }

    const bytes = []
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2))
    }

    return Buffer.from(bytes)
}

// Generate TOTP code
function generateTOTP(secret: string, time?: number): string {
    const counter = Math.floor((time || Date.now()) / 1000 / 30)
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeBigInt64BE(BigInt(counter))

    const secretBuffer = base32Decode(secret)
    const hmac = crypto.createHmac("sha1", secretBuffer)
    hmac.update(counterBuffer)
    const hash = hmac.digest()

    const offset = hash[hash.length - 1] & 0x0f
    const code = ((hash[offset] & 0x7f) << 24 |
        (hash[offset + 1] & 0xff) << 16 |
        (hash[offset + 2] & 0xff) << 8 |
        (hash[offset + 3] & 0xff)) % 1000000

    return code.toString().padStart(6, "0")
}

// Verify TOTP code (with 1 step window for clock drift)
function verifyTOTP(token: string, secret: string): boolean {
    const now = Date.now()
    // Check current, previous and next 30-second windows
    for (let i = -1; i <= 1; i++) {
        const time = now + (i * 30 * 1000)
        if (generateTOTP(secret, time) === token) {
            return true
        }
    }
    return false
}

// Generate TOTP secret and QR code for admin
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: "Thiếu thông tin người dùng" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
        }

        if (user.role !== "admin") {
            return NextResponse.json({ error: "Chỉ admin mới có thể bật 2FA" }, { status: 403 })
        }

        // Generate new secret (20 bytes = 32 base32 characters)
        const secretBytes = crypto.randomBytes(20)
        const secret = base32Encode(secretBytes)

        // Create otpauth URL for QR code
        const appName = "GDU Career Admin"
        const issuer = encodeURIComponent(appName)
        const account = encodeURIComponent(user.email)
        const otpAuthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
            width: 256,
            margin: 2,
            color: {
                dark: "#1e3a5f",
                light: "#ffffff"
            }
        })

        // Generate 10 recovery codes
        const recoveryCodes = Array.from({ length: 10 }, () =>
            crypto.randomBytes(4).toString("hex").toUpperCase()
        )

        // Hash recovery codes for storage
        const hashedRecoveryCodes = recoveryCodes.map(code =>
            crypto.createHash("sha256").update(code).digest("hex")
        )

        // Store pending secret (not enabled yet until verified)
        await prisma.user.update({
            where: { id: userId },
            data: {
                pendingTotpSecret: secret,
                pendingRecoveryCodes: hashedRecoveryCodes
            }
        })

        return NextResponse.json({
            success: true,
            qrCode: qrCodeDataUrl,
            secret: secret, // Also return secret for manual entry
            recoveryCodes: recoveryCodes // Return plain codes only once
        })

    } catch (error) {
        console.error("Setup TOTP error:", error)
        return NextResponse.json({ error: "Có lỗi xảy ra khi thiết lập 2FA" }, { status: 500 })
    }
}

// Verify TOTP token and enable 2FA
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { userId, token } = body

        if (!userId || !token) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
        }

        if (!user.pendingTotpSecret) {
            return NextResponse.json({ error: "Chưa có yêu cầu thiết lập 2FA" }, { status: 400 })
        }

        // Verify the token
        const isValid = verifyTOTP(token, user.pendingTotpSecret)

        if (!isValid) {
            return NextResponse.json({ error: "Mã xác thực không đúng. Vui lòng thử lại." }, { status: 400 })
        }

        // Enable TOTP
        await prisma.user.update({
            where: { id: userId },
            data: {
                totpEnabled: true,
                totpSecret: user.pendingTotpSecret,
                recoveryCodes: user.pendingRecoveryCodes,
                pendingTotpSecret: null,
                pendingRecoveryCodes: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Đã bật xác thực 2 bước thành công!"
        })

    } catch (error) {
        console.error("Verify TOTP error:", error)
        return NextResponse.json({ error: "Có lỗi xảy ra khi xác thực" }, { status: 500 })
    }
}

// Disable TOTP (requires password verification)
export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { userId, password } = body

        if (!userId || !password) {
            return NextResponse.json({ error: "Thiếu thông tin xác thực" }, { status: 400 })
        }

        const bcrypt = await import("bcryptjs")
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 })
        }

        // Disable TOTP
        await prisma.user.update({
            where: { id: userId },
            data: {
                totpEnabled: false,
                totpSecret: null,
                recoveryCodes: null,
                pendingTotpSecret: null,
                pendingRecoveryCodes: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Đã tắt xác thực 2 bước"
        })

    } catch (error) {
        console.error("Disable TOTP error:", error)
        return NextResponse.json({ error: "Có lỗi xảy ra khi tắt 2FA" }, { status: 500 })
    }
}

// Export TOTP functions for use in verify-2fa route
export { verifyTOTP, base32Decode }

