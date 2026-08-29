/**
 * Haversine formula to compute great-circle distance between two coordinates in kilometers.
 * Completely client-side, zero network calls.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface CityCoordinate {
  city: string;
  lat: number;
  lng: number;
}

// Canonical city coordinates derived from colleges.json town centers
export const TELANGANA_CITIES: CityCoordinate[] = [
  { city: 'Hyderabad', lat: 17.39, lng: 78.47 },
  { city: 'Secunderabad', lat: 17.44, lng: 78.50 },
  { city: 'Warangal', lat: 17.97, lng: 79.59 },
  { city: 'Nizamabad', lat: 18.67, lng: 78.09 },
  { city: 'Karimnagar', lat: 18.44, lng: 79.13 },
  { city: 'Khammam', lat: 17.25, lng: 80.15 },
  { city: 'Mahabubnagar', lat: 16.75, lng: 77.99 },
  { city: 'Nalgonda', lat: 17.05, lng: 79.27 },
  { city: 'Siddipet', lat: 18.10, lng: 78.85 },
  { city: 'Suryapet', lat: 17.14, lng: 79.62 },
  { city: 'Adilabad', lat: 19.67, lng: 78.53 },
  { city: 'Mancherial', lat: 18.87, lng: 79.46 },
  { city: 'Ramagundam', lat: 18.76, lng: 79.48 },
  { city: 'Jagtial', lat: 18.79, lng: 78.91 },
  { city: 'Nirmal', lat: 19.10, lng: 78.35 },
  { city: 'Kamareddy', lat: 18.32, lng: 78.34 },
  { city: 'Sangareddy', lat: 17.63, lng: 78.08 },
  { city: 'Medak', lat: 18.05, lng: 78.27 },
  { city: 'Sircilla', lat: 18.38, lng: 78.82 },
  { city: 'Vikarabad', lat: 17.34, lng: 77.90 },
  { city: 'Wanaparthy', lat: 16.36, lng: 78.06 },
  { city: 'Nagarkurnool', lat: 16.48, lng: 78.32 },
  { city: 'Narayanpet', lat: 16.74, lng: 77.50 },
  { city: 'Kothagudem', lat: 17.55, lng: 80.62 },
  { city: 'Mahabubabad', lat: 17.60, lng: 80.00 },
  { city: 'Bhupalpally', lat: 18.43, lng: 79.88 },
  { city: 'Jangaon', lat: 17.73, lng: 79.17 },
  { city: 'Asifabad', lat: 19.37, lng: 79.28 },
  { city: 'Mulugu', lat: 18.19, lng: 80.00 },
  { city: 'Yadadri', lat: 17.52, lng: 78.88 },
  { city: 'Bibinagar', lat: 17.44, lng: 78.90 },
  { city: 'Jogulamba', lat: 16.23, lng: 77.80 },
  { city: 'Kodangal', lat: 17.00, lng: 77.67 },
  { city: 'Medchal', lat: 17.63, lng: 78.48 },
  { city: 'Patancheru', lat: 17.53, lng: 78.26 },
  { city: 'Qutbullapur', lat: 17.52, lng: 78.47 },
  { city: 'Bachupally', lat: 17.52, lng: 78.37 },
  { city: 'Chevella', lat: 17.30, lng: 78.13 },
  { city: 'Peerancheru', lat: 17.38, lng: 78.30 },
  { city: 'Narketpally', lat: 17.05, lng: 79.17 },
];
