# AGENTS.md

Bun + TypeScript Weather CLI. Entry `src/index.ts`. Spec in `README.md` (Spanish); layout in `references/file-system.md`.

## Commands

- Run: `bun run src/index.ts` (`bun run start`, dev: `bun run dev`)
- Typecheck: `bunx tsc --noEmit`
- Build binary: `bun run build` (`bun build src/index.ts --compile --outfile weather`)
- No test/lint scripts defined. Don't add frameworks unprompted.

## Layout (`src/`)

- `actions/`: `getWeather.ts` (opts 1-2), `getForecast.ts` (opt 6, 7-day min/max), `addCity.ts` (3), `removeCity.ts` (4), `setDefaultCity.ts` (5), `listCities.ts`
- `presentation/`: `menu.ts` (`runMenu` loop + dispatch), `output.ts` (`printMenu`), `input.ts` (`ask`, index validation)
- `storage/`: `citiesStorage.ts` (`DATA_PATH`, `loadStore`, `saveStore`, `findCity`), `settingsStorage.ts` (`toggleUnit`)
- `types/`: `City.ts` (`City`, `Store`, `TemperatureUnit`), `Weather.ts` (Open-Meteo shapes), `MenuOption.ts`
- `api/`: `geocoding.ts`, `weather.ts` (`fetchTemperature`, `fetchDailyForecast`)
- `utils/`: `colors.ts` (ANSI), `format.ts` (`cityLabel`, `unitLabel`), `constants.ts` (`DATA_FILENAME`, `DEFAULT_STORE`, API bases)

## TS config gotchas (`tsconfig.json`)

- `moduleResolution: bundler` + `allowImportingTsExtensions` + `verbatimModuleSyntax`: use explicit `.ts` extensions and `import type` where applicable.
- `strict` + `noUncheckedIndexedAccess` + `noFallthroughCasesInSwitch` on.

## Target app (from README)

- Weather CLI using Open-Meteo, no API key:
  - Geocode: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
  - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`
- Features: default city, saved city list, add/remove, °C toggle, menu in README.
- Use Bun-native APIs (`fetch`, file I/O). Prefer `Bun.file` for local persistence.
- Persistence: single `weather-data.json` at project root (`DATA_PATH` in `citiesStorage.ts`); next to binary when compiled (`/$bunfs` → `dirname(process.execPath)`).
