import { getUserProfile, requireRole } from '@/lib/auth/session'
import { FarmerSidebar } from '@/components/layout/FarmerSidebar'

export default async function FarmerShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(['farmer', 'admin'])
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-zinc-50/60 flex">
      <FarmerSidebar profile={profile} />
      <div className="flex-1 lg:pl-64">{children}</div>
    </div>
  )
}
