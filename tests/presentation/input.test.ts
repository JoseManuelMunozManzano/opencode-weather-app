import { describe, test, expect, afterEach } from "bun:test";
import { ask, isValidIndex, toZeroBasedIndex } from "../../src/presentation/input.ts";
import { stubPrompt } from "../helpers/test-utils.ts";

let restorePrompt: (() => void) | undefined;

afterEach(() => {
  restorePrompt?.();
  restorePrompt = undefined;
});

describe("ask", () => {
  test("recorta espacios", () => {
    restorePrompt = stubPrompt(["  Madrid  "]);
    expect(ask("Ciudad: ")).toBe("Madrid");
  });

  test("null de prompt devuelve cadena vacía", () => {
    restorePrompt = stubPrompt([null]);
    expect(ask("Ciudad: ")).toBe("");
  });
});

describe("toZeroBasedIndex", () => {
  test("convierte 1 en 0", () => {
    expect(toZeroBasedIndex("1")).toBe(0);
  });

  test("entrada no numérica devuelve NaN", () => {
    expect(Number.isNaN(toZeroBasedIndex("abc"))).toBe(true);
  });
});

describe("isValidIndex", () => {
  test("acepta límites válidos", () => {
    expect(isValidIndex(0, 2)).toBe(true);
    expect(isValidIndex(1, 2)).toBe(true);
  });

  test("rechaza negativos, overflow y no enteros", () => {
    expect(isValidIndex(-1, 2)).toBe(false);
    expect(isValidIndex(2, 2)).toBe(false);
    expect(isValidIndex(0, 0)).toBe(false);
    expect(isValidIndex(1.5, 3)).toBe(false);
    expect(isValidIndex(Number.NaN, 3)).toBe(false);
  });
});
