import { describe, test, expect, afterEach } from "bun:test";
import { printMenu } from "../../src/presentation/output.ts";
import { makeStore, captureConsole } from "../helpers/test-utils.ts";

let restoreConsole: (() => void) | undefined;

afterEach(() => {
  restoreConsole?.();
  restoreConsole = undefined;
});

describe("printMenu", () => {
  test("muestra conteo de ciudades y unidad °C", () => {
    const { lines, restore } = captureConsole();
    restoreConsole = restore;
    printMenu(makeStore({ cities: [{ name: "A", latitude: 0, longitude: 0 }], unit: "celsius" }));
    const out = lines.join("\n");
    expect(out).toContain("WEATHER CLI");
    expect(out).toContain("Clima de todas las ciudades (1)");
    expect(out).toContain("°C");
    expect(out).toContain("9. Salir");
  });

  test("muestra °F y conteo cero", () => {
    const { lines, restore } = captureConsole();
    restoreConsole = restore;
    printMenu(makeStore({ cities: [], unit: "fahrenheit" }));
    const out = lines.join("\n");
    expect(out).toContain("(0)");
    expect(out).toContain("°F");
  });
});
