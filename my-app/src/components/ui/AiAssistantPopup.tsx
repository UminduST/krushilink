'use client'

import { useState } from 'react'

const starterPrompts = [
  'How do demand pools work?',
  'What is MOQ?',
  'How does PayHere escrow work?',
  'When should I list a harvest?',
]

export function AiAssistantPopup() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; text: string }>>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I can help with listings, pricing, payment flow, and district matching for KrushiLink.',
    },
  ])
  const [loading, setLoading] = useState(false)

  async function askAssistant() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextUserMessage = { id: Date.now(), role: 'user' as const, text: trimmed }
    setMessages((current) => [...current, nextUserMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json()
      const answer = data?.reply ?? 'I am ready to help with KrushiLink tasks.'

      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: answer }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          role: 'assistant',
          text: error instanceof Error ? error.message : 'The assistant is unavailable right now.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-2xl shadow-emerald-600/30 transition hover:scale-105 hover:bg-emerald-700"
        aria-label="Open AI assistant"
      >
        🤖
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-emerald-600 px-4 py-3 text-white">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">KrushiLink AI</div>
              <div className="text-sm font-black">Smart assistant</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-xl font-bold">×</button>
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto bg-zinc-50 p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-emerald-600 text-white'
                    : 'bg-white text-zinc-700 border border-zinc-200'
                }`}
              >
                {message.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:border-emerald-300 hover:text-emerald-700"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') askAssistant()
                }}
                placeholder="Ask KrushiLink AI..."
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={askAssistant}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
