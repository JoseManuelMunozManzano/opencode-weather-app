export interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

export interface DailyForecastResponse {
  daily?: {
    time?: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
}

export interface DailyForecast {
  time: string[];
  min: number[];
  max: number[];
}
