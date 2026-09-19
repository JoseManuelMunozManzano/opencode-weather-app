import type { Store } from "../types/City.ts";
import { green, red } from "../utils/colors.ts";
import { ask, isValidIndex, toZeroBasedIndex } from "../presentation/input.ts";
import { DATA_PATH, saveStore } from "../storage/citiesStorage.ts";
import { listCities } from "./listCities.ts";

export async function handleRemove(store: Store, dataPath: string = DATA_PATH): Promise<Store> {
  if (store.cities.length === 0) {
    console.log(red("  No hay ciudades para eliminar."));
    return store;
  }
  listCities(store);
  const choice = ask("  Número a eliminar: ");
  const index = toZeroBasedIndex(choice);
  const target = store.cities[index];
  if (!isValidIndex(index, store.cities.length) || !target) {
    console.log(red("  Selección inválida."));
    return store;
  }
  const updated: Store = { ...store, cities: store.cities.filter((_, i) => i !== index) };
  if (updated.defaultCity === target.name) updated.defaultCity = updated.cities[0]?.name;
  await saveStore(updated, dataPath);
  console.log(green(`  🗑️  Eliminada: ${target.name}`));
  return updated;
}
