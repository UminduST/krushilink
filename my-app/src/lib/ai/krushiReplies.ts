/**
 * Local assistant replies until an LLM is wired.
 * After GitHub: POST /api/ai/chat should call OpenAI/Gemini with harvest context.
 */
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export const AI_STARTER_PROMPTS = [
  'How do demand pools work?',
  'What is MOQ?',
  'How does PayHere escrow work?',
  'When should I list a harvest?',
] as const

export function localAssistantReply(question: string) {
  const q = question.toLowerCase()

  if (q.includes('pool') || q.includes('demand')) {
    return 'Retailers join a demand pool on a harvest listing. When committed kg reaches the farmer MOQ, KrushiLink closes the pool and can generate a logistics manifest. You will connect auto-close + SMS after the GitHub setup.'
  }
  if (q.includes('moq') || q.includes('minimum')) {
    return 'MOQ is the minimum order quantity (kg) the farmer needs before harvest is worth coordinating. Retailers can split that volume across several shops in one pool.'
  }
  if (q.includes('pay') || q.includes('escrow') || q.includes('payhere')) {
    return 'Retailers will pay in LKR via PayHere. Funds stay in escrow until delivery is confirmed, then the farmer payout is released. The checkout UI is ready; attach merchant ID, hash, and notify_url next.'
  }
  if (q.includes('list') || q.includes('harvest') || q.includes('crop')) {
    return 'Farmers should list 3–5 days before harvest with crop, kg, price/kg, MOQ, and the availability window. That gives retailers time to pool orders and book transport.'
  }
  if (q.includes('sms') || q.includes('phone')) {
    return 'Many farmers use basic phones, so alerts should go out over SMS (Dialog Axiata first, Twilio fallback)—not only push notifications.'
  }

  return 'I can help with listings, demand pools, MOQ, escrow, and PayHere. After you add an API key, this popup will answer from live harvest data. For now I use built-in KrushiLink guidance.'
}
