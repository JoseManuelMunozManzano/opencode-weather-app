# AGENTS.md

Bun + TypeScript Weather CLI. Entry `src/index.ts`. Spec in `README.md` (Spanish); layout in `references/file-system.md`.

## Commands

- Run: `bun run src/index.ts` (`bun run start`, dev: `bun run dev`)
- Test: `bun run test` (`bun test --isolate`, only `bun:test`, no extra frameworks)
- Coverage: `bun run test:coverage` (`bun test --isolate --coverage`, informative)
- Typecheck: `bun run typecheck` (`bunx tsc --noEmit`)
- Build binary: `bun run build` (gate: `bun test --isolate && bunx tsc --noEmit && bun build --compile src/index.ts --outfile weather`)
- Quality gate: any failing test or TS error blocks `weather` binary creation. Coverage never blocks build.
- Version: `package.json` `version` (current `1.0.0`) is release source of truth; tag is `v<version>` (ej. `v1.0.0`).
- No lint scripts defined. Don't add frameworks unprompted.

## Release (`.github/workflows/release.yml`)

- Trigger: push to `main` when `package.json` changes. Bump `version` to publish.
- Build matrix runs `bun run build` on `ubuntu-latest`, `macos-latest`, `windows-latest` (Bun `1.4.2`, `bun install --frozen-lockfile`).
- Assets: `weather-linux-x64`, `weather-macos-arm64`, `weather-windows-x64.exe`.
- Release job reads version with Bun, validates SemVer, skips if tag exists, else `gh release create "v<version>" dist/* --generate-notes` using automatic `${{ github.token }}` (`permissions: contents: write`). No manual secrets or external services.

## Testing (`tests/`, Bun-native only)

- Runner: `bun:test` (`describe/test/expect/mock/spyOn/beforeEach/afterEach`). Always run with `--isolate` (module mocks in `menu.test.ts` leak across files otherwise).
- Layout mirrors `src/`: `api/`, `storage/`, `actions/`, `presentation/`, `utils/`, plus `helpers/test-utils.ts` (fixtures, temp paths, `stubFetch`, `stubPrompt`, `captureConsole`).
- Isolation policy: no real Open-Meteo calls, no real `weather-data.json` writes. Stub global `fetch`/`prompt`/`console.log`; storage/actions accept optional `dataPath` (defaults to `DATA_PATH`) and tests use `tmpdir()` files.
- Module mocks: only `tests/presentation/menu.test.ts` uses `mock.module()` to stub `loadStore`, `ask`, `printMenu`, handlers, `toggleUnit`. All other tests use fetch/prompt spies + temp files.
- Current status: 74 tests, ~99% funcs/lines; `src/presentation/menu.ts:46` (unreachable default after mocked loop) is only uncovered line.

## Layout (`src/`)

- `actions/`: `getWeather.ts` (opts 1-2), `getForecast.ts` (opt 6, 7-day min/max), `addCity.ts` (3), `removeCity.ts` (4), `setDefaultCity.ts` (5), `listCities.ts`
- `presentation/`: `menu.ts` (`runMenu` loop + dispatch), `output.ts` (`printMenu`), `input.ts` (`ask`, index validation)
- `storage/`: `citiesStorage.ts` (`DATA_PATH`, `loadStore(dataPath?)`, `saveStore(store,dataPath?)`, `findCity`), `settingsStorage.ts` (`toggleUnit(store,dataPath?)`)
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
