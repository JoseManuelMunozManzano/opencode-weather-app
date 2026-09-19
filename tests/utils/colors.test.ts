import { describe, test, expect } from "bun:test";
import { CYAN, GREEN, RED, RESET, YELLOW, cyan, green, red, yellow } from "../../src/utils/colors.ts";

describe("colors", () => {
  test("cyan envuelve con códigos ANSI", () => {
    expect(cyan("hola")).toBe(`${CYAN}hola${RESET}`);
  });

  test("yellow envuelve con códigos ANSI", () => {
    expect(yellow("21°C")).toBe(`${YELLOW}21°C${RESET}`);
  });

  test("green envuelve con códigos ANSI", () => {
    expect(green("ok")).toBe(`${GREEN}ok${RESET}`);
  });

  test("red envuelve con códigos ANSI", () => {
    expect(red("error")).toBe(`${RED}error${RESET}`);
  });

  test("texto vacío mantiene envoltorio", () => {
    expect(cyan("")).toBe(`${CYAN}${RESET}`);
  });
});
