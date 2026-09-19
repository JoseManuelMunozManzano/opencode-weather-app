import type { City, TemperatureUnit } from "../types/City.ts";

export function unitLabel(unit: TemperatureUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function cityLabel(city: City): string {
  const region = [city.admin1, city.country].filter(Boolean).join(", ");
  return region ? `${city.name} (${region})` : city.name;
}
