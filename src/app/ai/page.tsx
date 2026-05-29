'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: string[]
}

const STARTER_QUESTIONS = [
  'What were the biggest MoM movers this month?',
  'Which channel has the highest TACOS trend?',
  'Show me the top 10 TikTok affiliates by GMV',
  'How is our refund rate trending vs the 6% target?',
  'Which SKU has the most stockout days?',
  'Compare Amazon USA vs Shopify revenue last 3 months',
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const apiMessages = newMessages.map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      const toolCalls: string[] = []

      const assistantMsg: Message = { role: 'assistant', content: '', toolCalls: [] }
      setMessages(prev => [...prev, assistantMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue

          try {
            const event = JSON.parse(raw)
            if (event.type === 'text') {
              assistantText += event.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: assistantText,
                }
                return updated
              })
            } else if (event.type === 'tool_call') {
              toolCalls.push(event.name)
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  toolCalls: [...toolCalls],
                }
                return updated
              })
            } else if (event.type === 'done') {
              break
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${msg}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">AI Analyst</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ask questions across your KPI history — Claude uses live tools to answer.
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Starter questions sidebar */}
        <div className="w-52 shrink-0 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Starter questions</p>
          {STARTER_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="w-full text-left text-xs p-2.5 bg-white rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-colors disabled:opacity-40 leading-relaxed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Bot className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  Ask me anything about your KPI data.
                  <br />I&apos;ll use tools to fetch real numbers.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-slate-200 text-slate-800',
                  )}
                >
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {m.toolCalls.map((tc, j) => (
                        <span key={j} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" />
                          {tc}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {loading && i === messages.length - 1 && m.role === 'assistant' && !m.content && (
                    <span className="inline-block animate-pulse text-slate-400">Thinking…</span>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 mt-3">
            <form
              onSubmit={e => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask about your KPI data…"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
