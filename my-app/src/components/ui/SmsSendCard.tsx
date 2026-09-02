'use client'

import { useState } from 'react'

type SmsSendCardProps = {
  phone: string
  message: string
}

export function SmsSendCard({ phone, message }: SmsSendCardProps) {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function sendSms() {
    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult(data?.error ?? 'SMS send failed.')
      } else {
        setResult(data?.provider === 'demo-free'
          ? 'Demo SMS sent successfully in local mode.'
          : 'SMS sent successfully.')
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Unable to send SMS.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">SMS gateway</p>
          <h4 className="mt-1 text-base font-black text-zinc-900">Send farm update</h4>
        </div>
        <button
          type="button"
          onClick={sendSms}
          disabled={sending}
          className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Send SMS'}
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-zinc-600">
        <div className="font-semibold text-zinc-800">To: {phone}</div>
        <div className="mt-1">{message}</div>
      </div>

      {result && (
        <p className="mt-3 text-xs text-zinc-700">{result}</p>
      )}
    </div>
  )
}
