import { SignJWT, jwtVerify } from "jose"

const secretKey = process.env.SESSION_SECRET || "default_secret_key_change_me"
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
    try {
        console.log(`[Session Debug] Decrypting session, length: ${session?.length || 0}, Secret present: ${!!secretKey}`)
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload
    } catch (error: any) {
        console.log(`[Session Debug] Decryption failed: ${error?.message || 'Unknown error'}`)
        return null
    }
}

export async function createSession(userId: string, role: string) {
    const { cookies } = await import("next/headers")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    console.log(`[Session Debug] Creating session for userId: ${userId}, role: ${role}`)
    const session = await encrypt({ userId, role, expiresAt })
    const cookieStore = await cookies()

    cookieStore.set("session", session, {
        httpOnly: true,
        secure: false,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    })
    console.log(`[Session Debug] Cookie 'session' set successfully`)
}

export async function deleteSession() {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.delete("session")
}
