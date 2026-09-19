import { describe, test, expect } from "bun:test";
import { listCities } from "../../src/actions/listCities.ts";
import { makeCity, makeStore, captureConsole } from "../helpers/test-utils.ts";

describe("listCities", () => {
  test("enumera con índice base 1", () => {
    const { lines, restore } = captureConsole();
    try {
      listCities(makeStore({ cities: [makeCity({ name: "Madrid" }), makeCity({ name: "Lima" })] }));
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain("1. Madrid");
      expect(lines[1]).toContain("2. Lima");
    } finally {
      restore();
    }
  });

  test("lista vacía no imprime", () => {
    const { lines, restore } = captureConsole();
    try {
      listCities(makeStore({ cities: [] }));
      expect(lines).toHaveLength(0);
    } finally {
      restore();
    }
  });
});
