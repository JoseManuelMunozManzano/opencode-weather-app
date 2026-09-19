import type { Store } from "../types/City.ts";
import type { City } from "../types/City.ts";
import { cityLabel } from "../utils/format.ts";
import { green, red } from "../utils/colors.ts";
import { ask } from "../presentation/input.ts";
import { geocodeCity } from "../api/geocoding.ts";
import { findCity, saveStore } from "../storage/citiesStorage.ts";

export async function handleAdd(store: Store): Promise<Store> {
  const query = ask("  Nombre de la ciudad: ");
  if (!query) {
    console.log("  Búsqueda cancelada.");
    return store;
  }
  try {
    const found = await geocodeCity(query);
    if (!found) {
      console.log(red(`  Sin resultados para "${query}".`));
      return store;
    }
    const city: City = {
      name: found.name,
      country: found.country,
      admin1: found.admin1,
      latitude: found.latitude,
      longitude: found.longitude,
    };
    if (findCity(store, city.name)) {
      console.log(`  ${cityLabel(city)} ya está registrada.`);
      return store;
    }
    const updated: Store = { ...store, cities: [...store.cities, city] };
    if (!updated.defaultCity) updated.defaultCity = city.name;
    await saveStore(updated);
    console.log(green(`  ✅ Agregada: ${cityLabel(city)}`));
    return updated;
  } catch (error) {
    console.log(red(`  ❌ Error buscando ciudad (${error instanceof Error ? error.message : error})`));
    return store;
  }
}
