import { requireRole, getUserProfile } from '@/lib/auth/session'
import { RetailerSidebar } from '@/components/layout/RetailerSidebar'
import { BackLogoutGuard } from '@/components/shared/BackLogoutGuard'

export default async function RetailerLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(['retailer', 'admin'])
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-zinc-50/60 flex">
      <BackLogoutGuard />
      <RetailerSidebar profile={profile} />
      <div className="flex-1 lg:pl-64">{children}</div>
    </div>
  )
}
