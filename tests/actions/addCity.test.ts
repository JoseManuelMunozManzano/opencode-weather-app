import { describe, test, expect, afterEach } from "bun:test";
import { handleAdd } from "../../src/actions/addCity.ts";
import { loadStore } from "../../src/storage/citiesStorage.ts";
import {
  makeStore,
  stubFetch,
  stubPrompt,
  captureConsole,
  tempDataPath,
  cleanupTempFile,
} from "../helpers/test-utils.ts";

let restoreFetch: (() => void) | undefined;
let restorePrompt: (() => void) | undefined;
const tempFiles: string[] = [];

afterEach(async () => {
  restoreFetch?.();
  restorePrompt?.();
  restoreFetch = undefined;
  restorePrompt = undefined;
  while (tempFiles.length > 0) {
    const path = tempFiles.pop();
    if (path) await cleanupTempFile(path);
  }
});

describe("handleAdd", () => {
  test("agrega ciudad y fija default cuando no existe", async () => {
    const path = tempDataPath("add-first");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["Ottawa"]);
    restoreFetch = stubFetch(
      () =>
        new Response(
          JSON.stringify({
            results: [
              { name: "Ottawa", country: "Canadá", admin1: "Ontario", latitude: 45.41, longitude: -75.69 },
            ],
          }),
          { status: 200 },
        ),
    );
    const { restore } = captureConsole();
    try {
      const updated = await handleAdd(makeStore({ cities: [], defaultCity: undefined }), path);
      expect(updated.cities).toHaveLength(1);
      expect(updated.defaultCity).toBe("Ottawa");
      await expect(loadStore(path)).resolves.toEqual(updated);
    } finally {
      restore();
    }
  });

  test("consulta vacía cancela sin cambios", async () => {
    const path = tempDataPath("add-cancel");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["   "]);
    const original = makeStore({ cities: [] });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleAdd(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("cancelada");
    } finally {
      restore();
    }
  });

  test("sin resultados conserva store", async () => {
    const path = tempDataPath("add-empty");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["Atlantis"]);
    restoreFetch = stubFetch(() => new Response(JSON.stringify({}), { status: 200 }));
    const original = makeStore({ cities: [] });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleAdd(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("Sin resultados");
    } finally {
      restore();
    }
  });

  test("duplicada no se agrega dos veces", async () => {
    const path = tempDataPath("add-dup");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["Madrid"]);
    restoreFetch = stubFetch(
      () =>
        new Response(
          JSON.stringify({ results: [{ name: "Madrid", latitude: 40.41, longitude: -3.7 }] }),
          { status: 200 },
        ),
    );
    const original = makeStore();
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleAdd(original, path);
      expect(updated.cities).toHaveLength(1);
      expect(lines.join("\n")).toContain("ya está registrada");
    } finally {
      restore();
    }
  });

  test("error de red conserva store", async () => {
    const path = tempDataPath("add-error");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["Madrid"]);
    restoreFetch = stubFetch(() => new Response("x", { status: 500 }));
    const original = makeStore({ cities: [] });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleAdd(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("Error buscando ciudad");
    } finally {
      restore();
    }
  });
});
