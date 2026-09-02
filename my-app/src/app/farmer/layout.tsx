import { requireRole } from '@/lib/auth/session'

export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['farmer', 'admin'])
  return <>{children}</>
}
