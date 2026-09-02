import { NextResponse } from 'next/server'
import { localAssistantReply } from '@/lib/ai/krushiReplies'

/**
 * Stub chat endpoint. After GitHub: if OPENAI_API_KEY (or Gemini) is set,
 * send messages + optional listing context to the model and store transcripts.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const message =
    typeof body === 'object' && body !== null && 'message' in body
      ? (body as { message: unknown }).message
      : null

  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const hasLlmKey = Boolean(process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)

  if (!hasLlmKey) {
    return NextResponse.json({
      provider: 'local',
      reply: localAssistantReply(message),
      hint: 'Add OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to stream real model replies.',
    })
  }

  return NextResponse.json(
    {
      error: 'LLM key is present but the provider client is not implemented yet.',
      next: 'Call OpenAI or Gemini here with KrushiLink system prompt + harvest context.',
    },
    { status: 501 }
  )
}
