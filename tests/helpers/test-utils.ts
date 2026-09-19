import { join } from "node:path";
import { tmpdir } from "node:os";
import type { City, Store } from "../../src/types/City.ts";

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    name: "Madrid",
    country: "España",
    admin1: "Madrid",
    latitude: 40.4165,
    longitude: -3.70256,
    ...overrides,
  };
}

export function makeStore(overrides: Partial<Store> = {}): Store {
  return {
    cities: [makeCity()],
    defaultCity: "Madrid",
    unit: "celsius",
    ...overrides,
  };
}

export function tempDataPath(prefix = "weather-test"): string {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return join(tmpdir(), `${prefix}-${unique}.json`);
}

export function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status: ok ? status : status,
    headers: { "Content-Type": "application/json" },
  });
}

export function stubFetch(impl: (url: string | URL | Request) => Response | Promise<Response>): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => impl(input)) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

export function stubPrompt(answers: Array<string | null>): () => void {
  const original = (globalThis as unknown as { prompt?: unknown }).prompt;
  let index = 0;
  (globalThis as unknown as { prompt: (q: string) => string | null }).prompt = () => {
    const value = answers[index];
    index += 1;
    return value ?? null;
  };
  return () => {
    if (original === undefined) {
      delete (globalThis as unknown as { prompt?: unknown }).prompt;
    } else {
      (globalThis as unknown as { prompt: unknown }).prompt = original;
    }
  };
}

export function captureConsole(): { lines: string[]; restore: () => void } {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map((a) => String(a)).join(" "));
  };
  return {
    lines,
    restore: () => {
      console.log = original;
    },
  };
}

export async function cleanupTempFile(path: string): Promise<void> {
  try {
    const file = Bun.file(path);
    if (await file.exists()) {
      const { unlink } = await import("node:fs/promises");
      await unlink(path);
    }
  } catch {
    // Mejor esfuerzo: los temporales no deben romper tests.
  }
}
