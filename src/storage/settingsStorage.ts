import type { Store } from "../types/City.ts";
import { unitLabel } from "../utils/format.ts";
import { green } from "../utils/colors.ts";
import { saveStore } from "./citiesStorage.ts";

export async function toggleUnit(store: Store): Promise<Store> {
  const updated: Store = { ...store, unit: store.unit === "celsius" ? "fahrenheit" : "celsius" };
  await saveStore(updated);
  console.log(green(`  Unidad: ${unitLabel(updated.unit)}`));
  return updated;
}
