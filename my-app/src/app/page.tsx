import Link from 'next/link'

const links = [
  { href: '/register', label: 'Create account', desc: 'Farmer or retailer registration', icon: '📝' },
  { href: '/login', label: 'Sign in', desc: 'Access your portal', icon: '🔐' },
  { href: '/farmer/dashboard', label: 'Farmer dashboard', desc: 'Manage harvests and orders', icon: '🌾' },
  { href: '/retailer/dashboard', label: 'Retailer dashboard', desc: 'Browse and order harvests', icon: '🏪' },
  { href: '/farmer/listings/new', label: 'New harvest entry', desc: 'List a crop before harvest', icon: '📦' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8fafc_38%,_#f1f5f9_100%)] text-zinc-900">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3 font-black text-xl text-emerald-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-lg">🌾</span>
            KrushiLink
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-900">
              Sign in
            </Link>
            <Link href="/register" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 lg:py-20">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Smart agri marketplace
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
              Sri Lanka&apos;s smarter farm-to-market network
            </h1>
            <p className="mt-4 max-w-xl text-base text-zinc-600">
              Connect farmers directly with retailers, coordinate harvest demand, and reduce waste with secure, timely transactions.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-lg shadow-emerald-100/80">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Live market health</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Online</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { value: '96%', label: 'Farmer match rate' },
                { value: '48h', label: 'Fast dispatch' },
                { value: 'LKR 1.2M', label: 'Weekly volume' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-zinc-50 p-3 text-center">
                  <div className="text-lg font-black text-zinc-900">{stat.value}</div>
                  <div className="mt-1 text-[10px] text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl shadow-inner shadow-emerald-100">{item.icon}</span>
              <div>
                <span className="block text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </span>
                <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
