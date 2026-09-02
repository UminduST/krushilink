export type DistrictMatch = {
  name: string
  distanceKm: number
}

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Gampaha: { lat: 7.0873, lng: 79.9993 },
  Kalutara: { lat: 6.5854, lng: 79.9607 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Matale: { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  Galle: { lat: 6.0535, lng: 80.2210 },
  Hambantota: { lat: 6.1246, lng: 81.1185 },
  Matara: { lat: 5.9485, lng: 80.5353 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Kilinochchi: { lat: 9.3961, lng: 80.3982 },
  Mannar: { lat: 8.9768, lng: 79.9041 },
  Vavuniya: { lat: 8.7559, lng: 80.4971 },
  Mullaitivu: { lat: 9.2671, lng: 80.8142 },
  Batticaloa: { lat: 7.7102, lng: 81.6924 },
  Ampara: { lat: 7.3000, lng: 81.6747 },
  Trincomalee: { lat: 8.5874, lng: 81.2152 },
  Kurunegala: { lat: 7.4863, lng: 80.3623 },
  Puttalam: { lat: 8.0362, lng: 79.8283 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037 },
  Polonnaruwa: { lat: 7.9395, lng: 81.0028 },
  Badulla: { lat: 6.9895, lng: 81.0550 },
  Monaragala: { lat: 6.8724, lng: 81.3471 },
  Ratnapura: { lat: 6.7056, lng: 80.3847 },
  Kegalle: { lat: 7.2513, lng: 80.3464 },
}

function haversineKm({ lat: lat1, lng: lng1 }: { lat: number; lng: number }, { lat: lat2, lng: lng2 }: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
}

export function getNearbyDistricts(centerDistrict: string, radiusKm = 80): DistrictMatch[] {
  const center = DISTRICT_COORDS[centerDistrict] ?? DISTRICT_COORDS.Colombo

  return Object.entries(DISTRICT_COORDS)
    .filter(([name]) => name !== centerDistrict)
    .map(([name, coords]) => ({
      name,
      distanceKm: Math.round(haversineKm(center, coords) * 10) / 10,
    }))
    .filter((district) => district.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

export function isDistrictWithinRadius(centerDistrict: string, candidateDistrict: string, radiusKm = 80) {
  const center = DISTRICT_COORDS[centerDistrict] ?? DISTRICT_COORDS.Colombo
  const candidate = DISTRICT_COORDS[candidateDistrict] ?? DISTRICT_COORDS.Colombo
  return haversineKm(center, candidate) <= radiusKm
}

export const SL_DISTRICT_COORDS = DISTRICT_COORDS
