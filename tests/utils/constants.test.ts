import { describe, test, expect } from "bun:test";
import { DATA_FILENAME, DEFAULT_STORE, FORECAST_BASE_URL, GEOCODING_BASE_URL } from "../../src/utils/constants.ts";

describe("constants", () => {
  test("nombre de datos y store por defecto", () => {
    expect(DATA_FILENAME).toBe("weather-data.json");
    expect(DEFAULT_STORE).toEqual({ cities: [], unit: "celsius" });
  });

  test("bases Open-Meteo usan HTTPS", () => {
    expect(GEOCODING_BASE_URL).toBe("https://geocoding-api.open-meteo.com/v1/search");
    expect(FORECAST_BASE_URL).toBe("https://api.open-meteo.com/v1/forecast");
  });
});
