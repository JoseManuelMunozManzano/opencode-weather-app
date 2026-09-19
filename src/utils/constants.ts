import type { Store } from "../types/City.ts";

export const DATA_FILENAME = "weather-data.json";

export const DEFAULT_STORE: Store = { cities: [], unit: "celsius" };

export const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";
