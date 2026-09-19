import type { City, TemperatureUnit } from "../types/City.ts";
import type {
  DailyForecast,
  DailyForecastResponse,
  ForecastResponse,
} from "../types/Weather.ts";
import { FORECAST_BASE_URL } from "../utils/constants.ts";

export async function fetchTemperature(city: City, unit: TemperatureUnit): Promise<number> {
  const url =
    `${FORECAST_BASE_URL}?latitude=${city.latitude}` +
    `&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  const temp = data.current?.temperature_2m;
  if (typeof temp !== "number") throw new Error("Respuesta de clima incompleta");
  return temp;
}

export async function fetchDailyForecast(
  city: City,
  unit: TemperatureUnit,
): Promise<DailyForecast> {
  const url =
    `${FORECAST_BASE_URL}?latitude=${city.latitude}` +
    `&longitude=${city.longitude}&daily=temperature_2m_min,temperature_2m_max` +
    `&forecast_days=7&temperature_unit=${unit}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
  const data = (await res.json()) as DailyForecastResponse;
  const time = data.daily?.time;
  const min = data.daily?.temperature_2m_min;
  const max = data.daily?.temperature_2m_max;
  if (!Array.isArray(time) || !Array.isArray(min) || !Array.isArray(max)) {
    throw new Error("Respuesta de pronóstico incompleta");
  }
  if (time.length === 0 || time.length !== min.length || time.length !== max.length) {
    throw new Error("Respuesta de pronóstico incompleta");
  }
  return { time, min, max };
}
