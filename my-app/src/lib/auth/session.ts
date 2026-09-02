import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/lib/types'

export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth(redirectTo = '/login') {
  const user = await getSessionUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireRole(roles: UserRole[], redirectTo = '/login') {
  const user = await requireAuth(redirectTo)
  const role = user.user_metadata?.role as UserRole | undefined

  if (!role || !roles.includes(role)) {
    redirect(role === 'retailer' ? '/retailer/dashboard' : '/farmer/dashboard')
  }

  return { user, role }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}
