import type { Store } from "../types/City.ts";
import { cityLabel } from "../utils/format.ts";

export function listCities(store: Store): void {
  store.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
}
