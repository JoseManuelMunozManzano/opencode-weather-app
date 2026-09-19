import { dirname, join } from "node:path";
import type { City, Store } from "../types/City.ts";
import { DATA_FILENAME, DEFAULT_STORE } from "../utils/constants.ts";
import { red } from "../utils/colors.ts";

export function dataDir(): string {
  // En binario compilado import.meta.dir apunta a /$bunfs (solo lectura).
  // Ahí se usa el directorio del ejecutable para que el JSON quede junto al CLI.
  if (import.meta.dir.startsWith("/$bunfs")) return dirname(process.execPath);
  return join(import.meta.dir, "../..");
}

export const DATA_PATH = join(dataDir(), DATA_FILENAME);

export function findCity(store: Store, name: string): City | undefined {
  return store.cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export async function loadStore(): Promise<Store> {
  try {
    const file = Bun.file(DATA_PATH);
    if (!(await file.exists())) return { ...DEFAULT_STORE, cities: [] };
    const raw = await file.json();
    if (!raw || typeof raw !== "object" || !Array.isArray((raw as Store).cities)) {
      console.log(red("Datos locales inválidos, se reinician."));
      return { ...DEFAULT_STORE, cities: [] };
    }
    const parsed = raw as Store;
    return {
      cities: parsed.cities.filter((c) => typeof c?.name === "string"),
      defaultCity: typeof parsed.defaultCity === "string" ? parsed.defaultCity : undefined,
      unit: parsed.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    console.log(red("No se pudo leer weather-data.json, se reinicia."));
    return { ...DEFAULT_STORE, cities: [] };
  }
}

export async function saveStore(store: Store): Promise<void> {
  await Bun.write(DATA_PATH, JSON.stringify(store, null, 2));
}
