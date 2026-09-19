import { describe, test, expect, afterEach } from "bun:test";
import { findCity, loadStore, saveStore } from "../../src/storage/citiesStorage.ts";
import { DEFAULT_STORE } from "../../src/utils/constants.ts";
import { makeCity, makeStore, tempDataPath, cleanupTempFile, captureConsole } from "../helpers/test-utils.ts";

const tempFiles: string[] = [];

afterEach(async () => {
  while (tempFiles.length > 0) {
    const path = tempFiles.pop();
    if (path) await cleanupTempFile(path);
  }
});

function trackTemp(path: string): string {
  tempFiles.push(path);
  return path;
}

describe("findCity", () => {
  test("busca insensible a mayúsculas", () => {
    const store = makeStore({ cities: [makeCity({ name: "Madrid" })] });
    expect(findCity(store, "madrid")?.name).toBe("Madrid");
    expect(findCity(store, "MADRID")?.name).toBe("Madrid");
  });

  test("devuelve undefined si no existe", () => {
    const store = makeStore({ cities: [] });
    expect(findCity(store, "Lima")).toBeUndefined();
  });
});

describe("loadStore", () => {
  test("archivo ausente devuelve store por defecto vacío", async () => {
    const path = trackTemp(tempDataPath("missing"));
    const store = await loadStore(path);
    expect(store).toEqual({ ...DEFAULT_STORE, cities: [] });
  });

  test("roundtrip save/load preserva datos", async () => {
    const path = trackTemp(tempDataPath("roundtrip"));
    const original = makeStore({ cities: [makeCity({ name: "Lima" })], defaultCity: "Lima", unit: "fahrenheit" });
    await saveStore(original, path);
    await expect(loadStore(path)).resolves.toEqual(original);
  });

  test("datos inválidos se reinician y avisan", async () => {
    const path = trackTemp(tempDataPath("invalid"));
    await Bun.write(path, JSON.stringify({ cities: "no-array" }));
    const { lines, restore } = captureConsole();
    try {
      const store = await loadStore(path);
      expect(store).toEqual({ ...DEFAULT_STORE, cities: [] });
      expect(lines.join("\n")).toContain("inválidos");
    } finally {
      restore();
    }
  });

  test("JSON corrupto se reinicia y avisa", async () => {
    const path = trackTemp(tempDataPath("corrupt"));
    await Bun.write(path, "{no-json");
    const { lines, restore } = captureConsole();
    try {
      const store = await loadStore(path);
      expect(store.cities).toEqual([]);
      expect(lines.join("\n").length).toBeGreaterThan(0);
    } finally {
      restore();
    }
  });

  test("normaliza ciudades sin nombre y unidad desconocida", async () => {
    const path = trackTemp(tempDataPath("normalize"));
    await Bun.write(
      path,
      JSON.stringify({ cities: [{ name: "Ok" }, { name: 123 }, null], defaultCity: 42, unit: "kelvin" }),
    );
    const store = await loadStore(path);
    expect(store.cities).toHaveLength(1);
    expect(store.cities[0]?.name).toBe("Ok");
    expect(store.unit).toBe("celsius");
    expect(store.defaultCity).toBeUndefined();
  });
});

describe("saveStore", () => {
  test("escribe JSON con formato en ruta indicada", async () => {
    const path = trackTemp(tempDataPath("write"));
    const store = makeStore({ cities: [makeCity({ name: "Quito" })] });
    await saveStore(store, path);
    const raw = await Bun.file(path).text();
    expect(JSON.parse(raw)).toEqual(store);
    expect(raw).toContain("\n");
  });
});
