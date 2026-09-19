import type { GeocodingResponse, GeocodingResult } from "../types/Weather.ts";
import { GEOCODING_BASE_URL } from "../utils/constants.ts";

export async function geocodeCity(query: string): Promise<GeocodingResult | null> {
  const url =
    `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}` +
    `&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = (await res.json()) as GeocodingResponse;
  return data.results?.[0] ?? null;
}
