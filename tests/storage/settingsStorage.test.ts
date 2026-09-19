import { describe, test, expect, afterEach } from "bun:test";
import { toggleUnit } from "../../src/storage/settingsStorage.ts";
import { loadStore } from "../../src/storage/citiesStorage.ts";
import { makeStore, tempDataPath, cleanupTempFile, captureConsole } from "../helpers/test-utils.ts";

const tempFiles: string[] = [];

afterEach(async () => {
  while (tempFiles.length > 0) {
    const path = tempFiles.pop();
    if (path) await cleanupTempFile(path);
  }
});

describe("toggleUnit", () => {
  test("celsius pasa a fahrenheit y persiste", async () => {
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const path = join(tmpdir(), `unit-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
    tempFiles.push(path);
    const store = makeStore({ unit: "celsius" });
    const { restore } = captureConsole();
    try {
      const updated = await toggleUnit(store, path);
      expect(updated.unit).toBe("fahrenheit");
      await expect(loadStore(path)).resolves.toMatchObject({ unit: "fahrenheit" });
    } finally {
      restore();
    }
  });

  test("fahrenheit pasa a celsius", async () => {
    const path = tempDataPath("unit-f2c");
    tempFiles.push(path);
    const { restore } = captureConsole();
    try {
      const updated = await toggleUnit(makeStore({ unit: "fahrenheit" }), path);
      expect(updated.unit).toBe("celsius");
    } finally {
      restore();
    }
  });

  test("muestra etiqueta °F al cambiar", async () => {
    const path = tempDataPath("unit-label");
    tempFiles.push(path);
    const { lines, restore } = captureConsole();
    try {
      await toggleUnit(makeStore({ unit: "celsius" }), path);
      expect(lines.join("\n")).toContain("°F");
    } finally {
      restore();
    }
  });
});
