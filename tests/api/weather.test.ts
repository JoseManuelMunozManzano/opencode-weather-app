import { describe, test, expect, afterEach } from "bun:test";
import { fetchTemperature, fetchDailyForecast } from "../../src/api/weather.ts";
import { makeCity, stubFetch } from "../helpers/test-utils.ts";

let restoreFetch: (() => void) | undefined;

afterEach(() => {
  restoreFetch?.();
  restoreFetch = undefined;
});

describe("fetchTemperature", () => {
  test("devuelve temperatura e incluye unidad y coordenadas", async () => {
    const city = makeCity({ latitude: 40.41, longitude: -3.7 });
    let seenUrl = "";
    restoreFetch = stubFetch((input) => {
      seenUrl = String(input);
      return new Response(JSON.stringify({ current: { temperature_2m: 21.5 } }), { status: 200 });
    });

    const temp = await fetchTemperature(city, "celsius");

    expect(temp).toBe(21.5);
    expect(seenUrl).toContain("latitude=40.41");
    expect(seenUrl).toContain("longitude=-3.7");
    expect(seenUrl).toContain("current=temperature_2m");
    expect(seenUrl).toContain("temperature_unit=celsius");
  });

  test("propaga unidad fahrenheit", async () => {
    let seenUrl = "";
    restoreFetch = stubFetch((input) => {
      seenUrl = String(input);
      return new Response(JSON.stringify({ current: { temperature_2m: 70 } }), { status: 200 });
    });

    await fetchTemperature(makeCity(), "fahrenheit");
    expect(seenUrl).toContain("temperature_unit=fahrenheit");
  });

  test("lanza error con HTTP no-ok", async () => {
    restoreFetch = stubFetch(() => new Response("x", { status: 503 }));
    await expect(fetchTemperature(makeCity(), "celsius")).rejects.toThrow("Forecast HTTP 503");
  });

  test("lanza error con respuesta incompleta", async () => {
    restoreFetch = stubFetch(() => new Response(JSON.stringify({ current: {} }), { status: 200 }));
    await expect(fetchTemperature(makeCity(), "celsius")).rejects.toThrow("Respuesta de clima incompleta");
  });
});

describe("fetchDailyForecast", () => {
  const valid = {
    daily: {
      time: ["2026-01-01", "2026-01-02"],
      temperature_2m_min: [10, 11],
      temperature_2m_max: [20, 21],
    },
  };

  test("devuelve pronóstico 7 días válido", async () => {
    let seenUrl = "";
    restoreFetch = stubFetch((input) => {
      seenUrl = String(input);
      return new Response(JSON.stringify(valid), { status: 200 });
    });

    const forecast = await fetchDailyForecast(makeCity(), "celsius");

    expect(forecast.time).toEqual(["2026-01-01", "2026-01-02"]);
    expect(forecast.min).toEqual([10, 11]);
    expect(forecast.max).toEqual([20, 21]);
    expect(seenUrl).toContain("daily=temperature_2m_min,temperature_2m_max");
    expect(seenUrl).toContain("forecast_days=7");
    expect(seenUrl).toContain("timezone=auto");
  });

  test("lanza error con HTTP no-ok", async () => {
    restoreFetch = stubFetch(() => new Response("x", { status: 404 }));
    await expect(fetchDailyForecast(makeCity(), "celsius")).rejects.toThrow("Forecast HTTP 404");
  });

  test("lanza error con daily ausente", async () => {
    restoreFetch = stubFetch(() => new Response(JSON.stringify({}), { status: 200 }));
    await expect(fetchDailyForecast(makeCity(), "celsius")).rejects.toThrow("Respuesta de pronóstico incompleta");
  });

  test("lanza error con longitudes desalineadas", async () => {
    restoreFetch = stubFetch(
      () =>
        new Response(
          JSON.stringify({
            daily: { time: ["2026-01-01"], temperature_2m_min: [1, 2], temperature_2m_max: [3] },
          }),
          { status: 200 },
        ),
    );
    await expect(fetchDailyForecast(makeCity(), "celsius")).rejects.toThrow("Respuesta de pronóstico incompleta");
  });

  test("lanza error con series vacías", async () => {
    restoreFetch = stubFetch(
      () =>
        new Response(
          JSON.stringify({ daily: { time: [], temperature_2m_min: [], temperature_2m_max: [] } }),
          { status: 200 },
        ),
    );
    await expect(fetchDailyForecast(makeCity(), "celsius")).rejects.toThrow("Respuesta de pronóstico incompleta");
  });
});
