import { describe, test, expect, afterEach } from "bun:test";
import { handleRemove } from "../../src/actions/removeCity.ts";
import { loadStore } from "../../src/storage/citiesStorage.ts";
import {
  makeCity,
  makeStore,
  stubPrompt,
  captureConsole,
  tempDataPath,
  cleanupTempFile,
} from "../helpers/test-utils.ts";

let restorePrompt: (() => void) | undefined;
const tempFiles: string[] = [];

afterEach(async () => {
  restorePrompt?.();
  restorePrompt = undefined;
  while (tempFiles.length > 0) {
    const path = tempFiles.pop();
    if (path) await cleanupTempFile(path);
  }
});

describe("handleRemove", () => {
  test("lista vacía no cambia", async () => {
    const path = tempDataPath("rm-empty");
    tempFiles.push(path);
    const original = makeStore({ cities: [] });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleRemove(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("No hay ciudades");
    } finally {
      restore();
    }
  });

  test("elimina por número y persiste", async () => {
    const path = tempDataPath("rm-ok");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["2"]);
    const original = makeStore({ cities: [makeCity({ name: "A" }), makeCity({ name: "B" })], defaultCity: "A" });
    const { restore } = captureConsole();
    try {
      const updated = await handleRemove(original, path);
      expect(updated.cities.map((c) => c.name)).toEqual(["A"]);
      await expect(loadStore(path)).resolves.toEqual(updated);
    } finally {
      restore();
    }
  });

  test("eliminar default reasigna a primera restante", async () => {
    const path = tempDataPath("rm-default");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["1"]);
    const original = makeStore({ cities: [makeCity({ name: "A" }), makeCity({ name: "B" })], defaultCity: "A" });
    const { restore } = captureConsole();
    try {
      const updated = await handleRemove(original, path);
      expect(updated.defaultCity).toBe("B");
    } finally {
      restore();
    }
  });

  test("eliminar última deja default indefinido", async () => {
    const path = tempDataPath("rm-last");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["1"]);
    const original = makeStore({ cities: [makeCity({ name: "Solo" })], defaultCity: "Solo" });
    const { restore } = captureConsole();
    try {
      const updated = await handleRemove(original, path);
      expect(updated.cities).toHaveLength(0);
      expect(updated.defaultCity).toBeUndefined();
    } finally {
      restore();
    }
  });

  test("selección inválida conserva store", async () => {
    const path = tempDataPath("rm-invalid");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["99"]);
    const original = makeStore({ cities: [makeCity({ name: "A" })] });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleRemove(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("Selección inválida");
    } finally {
      restore();
    }
  });
});
