"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function DemoChat() {
  const [messages, setMessages] = useState<{ role: "user"|"assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: "user" as const, content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)
    const { data, error } = await apiClient.sendDemoMessage([userMsg])
    if (data) {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md p-4 max-w-lg mx-auto shadow-lg flex flex-col" style={{height: 500}}>
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((m, idx) => (
          <motion.div key={idx} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`px-3 py-2 rounded-lg max-w-[80%] ${m.role==='user'?'bg-blue-600 text-white ml-auto':'bg-slate-100 text-slate-900'}`}>
            {m.content}
          </motion.div>
        ))}
        {loading && <div className="flex items-center space-x-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/><span>Thinking...</span></div>}
      </div>
      <div className="pt-2 flex items-center space-x-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && send()} placeholder="Ask me anything…" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-transparent focus:outline-none"/>
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50" disabled={loading}>Send</button>
      </div>
    </div>
  )
} 