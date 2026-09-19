import type { City, Store, TemperatureUnit } from "../types/City.ts";
import { fetchDailyForecast } from "../api/weather.ts";
import { cityLabel, unitLabel } from "../utils/format.ts";
import { red, yellow } from "../utils/colors.ts";

export async function showForecast7Days(city: City, unit: TemperatureUnit): Promise<void> {
  try {
    const forecast = await fetchDailyForecast(city, unit);
    console.log(`  📅 Pronóstico 7 días: ${cityLabel(city)}`);
    forecast.time.forEach((date, i) => {
      const min = forecast.min[i];
      const max = forecast.max[i];
      if (typeof min !== "number" || typeof max !== "number") return;
      console.log(`  ${date}: min ${yellow(`${min}${unitLabel(unit)}`)} / max ${yellow(`${max}${unitLabel(unit)}`)}`);
    });
  } catch (error) {
    console.log(red(`  ❌ ${city.name}: no se pudo obtener el pronóstico (${error instanceof Error ? error.message : error})`));
  }
}

export async function handleForecast7Days(store: Store): Promise<void> {
  if (store.cities.length === 0) {
    console.log(red("  No hay ciudades. Usa la opción 3 para agregar una."));
    return;
  }
  for (const city of store.cities) {
    await showForecast7Days(city, store.unit);
  }
}
