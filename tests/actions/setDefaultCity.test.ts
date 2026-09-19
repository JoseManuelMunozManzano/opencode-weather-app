import { describe, test, expect, afterEach } from "bun:test";
import { handleSetDefault } from "../../src/actions/setDefaultCity.ts";
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

describe("handleSetDefault", () => {
  test("sin ciudades avisa", async () => {
    const path = tempDataPath("def-empty");
    tempFiles.push(path);
    const original = makeStore({ cities: [], defaultCity: undefined });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleSetDefault(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("No hay ciudades");
    } finally {
      restore();
    }
  });

  test("fija default válido y persiste", async () => {
    const path = tempDataPath("def-ok");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["2"]);
    const original = makeStore({ cities: [makeCity({ name: "A" }), makeCity({ name: "B" })], defaultCity: "A" });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleSetDefault(original, path);
      expect(updated.defaultCity).toBe("B");
      expect(lines.join("\n")).toContain("Default: B");
      await expect(loadStore(path)).resolves.toEqual(updated);
    } finally {
      restore();
    }
  });

  test("selección inválida conserva default", async () => {
    const path = tempDataPath("def-invalid");
    tempFiles.push(path);
    restorePrompt = stubPrompt(["7"]);
    const original = makeStore({ cities: [makeCity({ name: "A" })], defaultCity: "A" });
    const { lines, restore } = captureConsole();
    try {
      const updated = await handleSetDefault(original, path);
      expect(updated).toEqual(original);
      expect(lines.join("\n")).toContain("Selección inválida");
    } finally {
      restore();
    }
  });
});
