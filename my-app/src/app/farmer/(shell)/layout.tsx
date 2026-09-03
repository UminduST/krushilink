import { getUserProfile, requireRole } from '@/lib/auth/session'
import { FarmerSidebar } from '@/components/layout/FarmerSidebar'
import { BackLogoutGuard } from '@/components/shared/BackLogoutGuard'

export default async function FarmerShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(['farmer', 'admin'])
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-zinc-50/60 flex">
      <BackLogoutGuard />
      <FarmerSidebar profile={profile} />
      <div className="flex-1 lg:pl-64">{children}</div>
    </div>
  )
}
