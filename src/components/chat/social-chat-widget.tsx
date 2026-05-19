"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname } from "next/navigation"

export function SocialChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    window.addEventListener("close-chat-menu", handleClose)
    return () => window.removeEventListener("close-chat-menu", handleClose)
  }, [])

  const toggleOpen = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    if (nextState) {
      window.dispatchEvent(new CustomEvent("close-admin-menu"))
    }
  }

  if (pathname?.startsWith('/dashboard')) return null

  // Direct links - click to open immediately
  const handleZaloClick = () => {
    window.open("https://zalo.me/0796079423", "_blank")
    setIsOpen(false)
  }

  const handleMessengerClick = () => {
    window.open("https://m.me/GDUStudentCenter", "_blank")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 shadow-2xl animate-in slide-in-from-bottom-5 border-none overflow-hidden rounded-[32px]">
          <CardHeader className="bg-[#0A2647] text-white pb-3 pt-6 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Hỗ trợ trực tuyến</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 h-8 w-8 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-white">
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 px-2">Chọn kênh liên hệ:</p>

              {/* Zalo Button */}
              <button
                onClick={handleZaloClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all group/item text-left border border-transparent hover:border-blue-100"
              >
                <div className="bg-[#0068FF] p-2.5 rounded-xl group-hover/item:scale-110 transition-transform flex items-center justify-center w-10 h-10">
                  <span className="font-extrabold text-[10px] text-white leading-none">ZALO</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover/item:text-blue-700">Zalo</div>
                  <div className="text-[10px] text-slate-500 font-medium tracking-wide">Chat nhanh qua Zalo</div>
                </div>
              </button>

              {/* Messenger Button */}
              <button
                onClick={handleMessengerClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-purple-50 transition-all group/item text-left border border-transparent hover:border-purple-100"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl group-hover/item:scale-110 transition-transform flex items-center justify-center w-10 h-10">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover/item:text-purple-700">Facebook Messenger</div>
                  <div className="text-[10px] text-slate-500 font-medium tracking-wide">Chat qua Messenger</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={toggleOpen}
        className={`h-14 w-14 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 ${isOpen ? 'bg-[#0A2647]' : 'bg-red-600'} hover:bg-red-700 active:scale-95 border-2 border-red-500/50 ring-4 ring-red-500/10`}
      >
        {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-7 w-7 text-white" />}
      </Button>
    </div>
  )
}
