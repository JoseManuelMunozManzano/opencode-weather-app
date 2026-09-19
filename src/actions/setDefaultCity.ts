import type { Store } from "../types/City.ts";
import { green, red } from "../utils/colors.ts";
import { ask, toZeroBasedIndex } from "../presentation/input.ts";
import { DATA_PATH, saveStore } from "../storage/citiesStorage.ts";
import { listCities } from "./listCities.ts";

export async function handleSetDefault(store: Store, dataPath: string = DATA_PATH): Promise<Store> {
  if (store.cities.length === 0) {
    console.log(red("  No hay ciudades. Usa la opción 3 para agregar una."));
    return store;
  }
  listCities(store);
  const choice = ask("  Número de ciudad default: ");
  const target = store.cities[toZeroBasedIndex(choice)];
  if (!target) {
    console.log(red("  Selección inválida."));
    return store;
  }
  const updated: Store = { ...store, defaultCity: target.name };
  await saveStore(updated, dataPath);
  console.log(green(`  ⭐ Default: ${target.name}`));
  return updated;
}
