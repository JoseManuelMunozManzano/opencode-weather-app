import type { City, Store, TemperatureUnit } from "../types/City.ts";
import { fetchTemperature } from "../api/weather.ts";
import { cityLabel, unitLabel } from "../utils/format.ts";
import { red, yellow } from "../utils/colors.ts";
import { findCity } from "../storage/citiesStorage.ts";

export async function showWeather(city: City, unit: TemperatureUnit): Promise<void> {
  try {
    const temp = await fetchTemperature(city, unit);
    console.log(`  🌡️  ${cityLabel(city)}: ${yellow(`${temp}${unitLabel(unit)}`)}`);
  } catch (error) {
    console.log(red(`  ❌ ${city.name}: no se pudo obtener el clima (${error instanceof Error ? error.message : error})`));
  }
}

export async function handleDefault(store: Store): Promise<void> {
  if (!store.defaultCity) {
    console.log(red("  No hay ciudad default. Usa la opción 5."));
    return;
  }
  const city = findCity(store, store.defaultCity);
  if (!city) {
    console.log(red(`  La ciudad default "${store.defaultCity}" ya no está registrada.`));
    return;
  }
  await showWeather(city, store.unit);
}

export async function handleAll(store: Store): Promise<void> {
  if (store.cities.length === 0) {
    console.log(red("  No hay ciudades. Usa la opción 3 para agregar una."));
    return;
  }
  for (const city of store.cities) {
    await showWeather(city, store.unit);
  }
}
