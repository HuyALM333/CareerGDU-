"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: Partial<User> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  setAuthUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("gdu_user")
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          // Set user immediately to provide fast UI feedback
          setUser(parsedUser)

          // Verify with server if user still exists (in background)
          const userId = parsedUser.id || parsedUser._id
          if (userId) {
            try {
              const res = await fetch(`/api/users/${userId}`)
              if (res.status === 404) {
                console.warn("[Auth] User not found on server, logging out.")
                logout()
                return
              }

              if (res.ok) {
                const data = await res.json()
                if (data.success && data.user) {
                  // Update with fresh data if successful
                  setUser(data.user)
                  localStorage.setItem("gdu_user", JSON.stringify(data.user))
                }
              }
            } catch (fetchErr) {
              // If fetch fails (abort, network error, server down), 
              // we trust the local session instead of logging out
              console.log("[Auth] Background verify bypassed due to connection issue/abort")
            }
          }
        } catch (e) {
          console.error("[Auth] Session data corrupted:", e)
          localStorage.removeItem("gdu_user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      if (data.success && data.user) {
        setUser(data.user)
        localStorage.setItem("gdu_user", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const register = async (data: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem("gdu_user", JSON.stringify(result.user))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Register error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gdu_user")
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    console.log("[Auth updateProfile] Called with data:", JSON.stringify(data))
    try {
      if (user) {
        const userId = user.id || user._id
        console.log("[Auth updateProfile] User ID:", userId)
        if (!userId) {
          console.error("[Auth updateProfile] User ID not found!")
          throw new Error("User ID not found")
        }

        console.log("[Auth updateProfile] Sending PATCH to /api/users/" + userId)
        const response = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        console.log("[Auth updateProfile] Response status:", response.status)
        const responseData = await response.json()
        console.log("[Auth updateProfile] Response body:", JSON.stringify(responseData))

        if (!response.ok) {
          console.error("[Auth updateProfile] Server returned error:", responseData)
          throw new Error(responseData.error || "Failed to update profile on server")
        }

        // Use the user data returned from the server if available, otherwise merge
        const finalUser = responseData.success && responseData.user
          ? { ...user, ...responseData.user }
          : { ...user, ...data, updatedAt: new Date() }

        setUser(finalUser)
        localStorage.setItem("gdu_user", JSON.stringify(finalUser))
        console.log("[Auth updateProfile] Success! Updated localStorage with server data")
        return true
      }
      console.warn("[Auth updateProfile] No user in context!")
      return false
    } catch (error: any) {
      console.error("[Auth] Update profile error:", error)
      throw error // Re-throw to be caught by component
    }
  }

  const setAuthUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("gdu_user", JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
