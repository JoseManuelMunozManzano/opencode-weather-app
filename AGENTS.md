# AGENTS.md

Bun + TypeScript CLI scaffold. Only `index.ts` (`console.log` stub). Real spec lives in `README.md` (Spanish).

## Commands

- Run: `bun run index.ts`
- Typecheck: `bunx tsc --noEmit`
- Build binary (final goal per README): `bun build index.ts --compile --outfile weather`
- No test/lint scripts defined. Don't add frameworks unprompted.

## TS config gotchas (`tsconfig.json`)

- `moduleResolution: bundler` + `allowImportingTsExtensions` + `verbatimModuleSyntax`: use explicit `.ts` extensions and `import type` where applicable.
- `strict` + `noUncheckedIndexedAccess` + `noFallthroughCasesInSwitch` on.

## Target app (from README)

- Weather CLI using Open-Meteo, no API key:
  - Geocode: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
  - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`
- Features: default city, saved city list, add/remove, °C toggle, menu in README.
- Use Bun-native APIs (`fetch`, file I/O). Prefer `Bun.file` for local persistence.
