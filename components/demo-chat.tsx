"use client"

import { useState, useRef, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // assume existing
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function DemoChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [locked, setLocked] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!input.trim() || isStreaming || locked) return
    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsStreaming(true)

    let assistantContent = ""
    for await (const chunk of apiClient.sendDemoMessageStream([{ role: "user", content: userMsg.content }])) {
      if (chunk.type === "text_chunk") {
        assistantContent += chunk.data
        // upsert streaming message
        setMessages((prev) => {
          const others = prev.filter((m) => m.role !== "assistant_temp")
          return [...others, { role: "assistant_temp", content: assistantContent }]
        })
      } else if (chunk.type === "complete") {
        // finalize
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.role !== "assistant_temp")
          return [...filtered, { role: "assistant", content: assistantContent }]
        })
        setLocked(true)
        setIsStreaming(false)
      } else if (chunk.type === "error") {
        setIsStreaming(false)
        setLocked(true)
      }
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto border rounded-lg overflow-hidden shadow bg-white dark:bg-slate-800">
      <ScrollArea className="h-64 p-4 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"}`}>
              {m.content}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </ScrollArea>

      {locked ? (
        <div className="p-4 border-t text-center space-y-2">
          <p className="text-sm">Create an account to continue the conversation</p>
          <div className="flex justify-center space-x-2">
            <Button onClick={() => (window.location.href = "/auth/register?redirect=/chat")}>Sign up</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/auth/login?redirect=/chat")}>Sign in</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-end space-x-2 p-3 border-t">
          <Textarea
            className="flex-1 resize-none"
            rows={1}
            placeholder="Ask me anything about your next trip…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
          />
          <Button onClick={send} disabled={isStreaming || !input.trim()}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      )}
    </div>
  )
} 