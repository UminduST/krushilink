import type { ListingStatus, PoolStatus } from '@/lib/types'

const listingStyles: Record<ListingStatus, string> = {
  open: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  pool_active: 'bg-blue-50 border-blue-200 text-blue-800',
  fulfilled: 'bg-purple-50 border-purple-200 text-purple-800',
  cancelled: 'bg-zinc-50 border-zinc-200 text-zinc-600',
}

const poolStyles: Record<PoolStatus, string> = {
  open: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  closed: 'bg-amber-50 border-amber-200 text-amber-800',
  dispatched: 'bg-blue-50 border-blue-200 text-blue-800',
  completed: 'bg-purple-50 border-purple-200 text-purple-800',
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold tracking-wide inline-block border ${listingStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function PoolStatusBadge({ status }: { status: PoolStatus }) {
  return (
    <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold tracking-wide inline-block border ${poolStyles[status]}`}>
      {status}
    </span>
  )
}
