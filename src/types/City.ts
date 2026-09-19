export interface City {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface Store {
  cities: City[];
  defaultCity?: string;
  unit: TemperatureUnit;
}
