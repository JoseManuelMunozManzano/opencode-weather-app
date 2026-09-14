import { dirname, join } from "node:path";

interface City {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface Store {
  cities: City[];
  defaultCity?: string;
  unit: "celsius" | "fahrenheit";
}

interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

function dataDir(): string {
  // En binario compilado import.meta.dir apunta a /$bunfs (solo lectura).
  // Ahí se usa el directorio del ejecutable para que el JSON quede junto al CLI.
  if (import.meta.dir.startsWith("/$bunfs")) return dirname(process.execPath);
  return import.meta.dir;
}

const DATA_PATH = join(dataDir(), "weather-data.json");

const DEFAULT_STORE: Store = { cities: [], unit: "celsius" };

async function loadStore(): Promise<Store> {
  try {
    const file = Bun.file(DATA_PATH);
    if (!(await file.exists())) return { ...DEFAULT_STORE, cities: [] };
    const raw = await file.json();
    if (!raw || typeof raw !== "object" || !Array.isArray((raw as Store).cities)) {
      console.log("Datos locales inválidos, se reinician.");
      return { ...DEFAULT_STORE, cities: [] };
    }
    const parsed = raw as Store;
    return {
      cities: parsed.cities.filter((c) => typeof c?.name === "string"),
      defaultCity: typeof parsed.defaultCity === "string" ? parsed.defaultCity : undefined,
      unit: parsed.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    console.log("No se pudo leer weather-data.json, se reinicia.");
    return { ...DEFAULT_STORE, cities: [] };
  }
}

async function saveStore(store: Store): Promise<void> {
  await Bun.write(DATA_PATH, JSON.stringify(store, null, 2));
}

function ask(question: string): string {
  const answer = prompt(question);
  return answer?.trim() ?? "";
}

function unitLabel(unit: Store["unit"]): string {
  return unit === "celsius" ? "°C" : "°F";
}

function cityLabel(city: City): string {
  const region = [city.admin1, city.country].filter(Boolean).join(", ");
  return region ? `${city.name} (${region})` : city.name;
}

function findCity(store: Store, name: string): City | undefined {
  return store.cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

async function geocodeCity(query: string): Promise<GeocodingResult | null> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}` +
    `&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = (await res.json()) as GeocodingResponse;
  return data.results?.[0] ?? null;
}

async function fetchTemperature(city: City, unit: Store["unit"]): Promise<number> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}` +
    `&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  const temp = data.current?.temperature_2m;
  if (typeof temp !== "number") throw new Error("Respuesta de clima incompleta");
  return temp;
}

async function showWeather(city: City, unit: Store["unit"]): Promise<void> {
  try {
    const temp = await fetchTemperature(city, unit);
    console.log(`  🌡️  ${cityLabel(city)}: ${temp}${unitLabel(unit)}`);
  } catch (error) {
    console.log(`  ❌ ${city.name}: no se pudo obtener el clima (${error instanceof Error ? error.message : error})`);
  }
}

function printMenu(store: Store): void {
  console.log("════════════════════════════════════════");
  console.log("         WEATHER CLI");
  console.log("════════════════════════════════════════");
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${store.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitLabel(store.unit)})`);
  console.log("  9. Salir");
  console.log("════════════════════════════════════════");
}

async function handleDefault(store: Store): Promise<void> {
  if (!store.defaultCity) {
    console.log("  No hay ciudad default. Usa la opción 5.");
    return;
  }
  const city = findCity(store, store.defaultCity);
  if (!city) {
    console.log(`  La ciudad default "${store.defaultCity}" ya no está registrada.`);
    return;
  }
  await showWeather(city, store.unit);
}

async function handleAll(store: Store): Promise<void> {
  if (store.cities.length === 0) {
    console.log("  No hay ciudades. Usa la opción 3 para agregar una.");
    return;
  }
  for (const city of store.cities) {
    await showWeather(city, store.unit);
  }
}

async function handleAdd(store: Store): Promise<Store> {
  const query = ask("  Nombre de la ciudad: ");
  if (!query) {
    console.log("  Búsqueda cancelada.");
    return store;
  }
  try {
    const found = await geocodeCity(query);
    if (!found) {
      console.log(`  Sin resultados para "${query}".`);
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
    console.log(`  ✅ Agregada: ${cityLabel(city)}`);
    return updated;
  } catch (error) {
    console.log(`  ❌ Error buscando ciudad (${error instanceof Error ? error.message : error})`);
    return store;
  }
}

async function handleRemove(store: Store): Promise<Store> {
  if (store.cities.length === 0) {
    console.log("  No hay ciudades para eliminar.");
    return store;
  }
  store.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const choice = ask("  Número a eliminar: ");
  const index = Number(choice) - 1;
  const target = store.cities[index];
  if (!Number.isInteger(index) || !target) {
    console.log("  Selección inválida.");
    return store;
  }
  const updated: Store = { ...store, cities: store.cities.filter((_, i) => i !== index) };
  if (updated.defaultCity === target.name) updated.defaultCity = updated.cities[0]?.name;
  await saveStore(updated);
  console.log(`  🗑️  Eliminada: ${target.name}`);
  return updated;
}

async function handleSetDefault(store: Store): Promise<Store> {
  if (store.cities.length === 0) {
    console.log("  No hay ciudades. Usa la opción 3 para agregar una.");
    return store;
  }
  store.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const choice = ask("  Número de ciudad default: ");
  const target = store.cities[Number(choice) - 1];
  if (!target) {
    console.log("  Selección inválida.");
    return store;
  }
  const updated: Store = { ...store, defaultCity: target.name };
  await saveStore(updated);
  console.log(`  ⭐ Default: ${target.name}`);
  return updated;
}

async function handleToggleUnit(store: Store): Promise<Store> {
  const updated: Store = { ...store, unit: store.unit === "celsius" ? "fahrenheit" : "celsius" };
  await saveStore(updated);
  console.log(`  Unidad: ${unitLabel(updated.unit)}`);
  return updated;
}

async function main(): Promise<void> {
  let store = await loadStore();
  while (true) {
    printMenu(store);
    const option = ask("  Selecciona una opción: ");
    switch (option) {
      case "1":
        await handleDefault(store);
        break;
      case "2":
        await handleAll(store);
        break;
      case "3":
        store = await handleAdd(store);
        break;
      case "4":
        store = await handleRemove(store);
        break;
      case "5":
        store = await handleSetDefault(store);
        break;
      case "8":
        store = await handleToggleUnit(store);
        break;
      case "9":
        console.log("  ¡Hasta luego!");
        return;
      default:
        console.log("  Opción inválida. Elige 1, 2, 3, 4, 5, 8 o 9.");
        break;
    }
  }
}

await main();
