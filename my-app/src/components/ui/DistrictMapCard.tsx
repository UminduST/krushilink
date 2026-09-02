type DistrictMatch = {
  name: string
  distanceKm: number
}

type DistrictMapCardProps = {
  district: string
  nearbyDistricts: DistrictMatch[]
}

export function DistrictMapCard({ district, nearbyDistricts }: DistrictMapCardProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Geo-fencing</p>
          <h3 className="mt-1 text-xl font-black text-zinc-900">{district} district coverage</h3>
        </div>
        <div className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
          80 km match radius
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
            <span>Selected district</span>
            <span>Match radius</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-black text-zinc-900">{district}</div>
              <div className="text-xs text-zinc-500">Primary sourcing zone</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-700">80 km</div>
              <div className="text-xs text-zinc-500">Radius</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-900 p-4 text-white">
          <p className="text-xs uppercase tracking-wider text-emerald-200">Nearby districts</p>
          <div className="mt-2 space-y-2 text-sm">
            {nearbyDistricts.length ? (
              nearbyDistricts.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                  <span>{item.name}</span>
                  <span className="font-bold text-emerald-200">{item.distanceKm} km</span>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-white/5 px-2 py-1.5 text-emerald-100">No nearby districts in the default radius.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
