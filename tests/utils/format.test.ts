import { describe, test, expect } from "bun:test";
import { cityLabel, unitLabel } from "../../src/utils/format.ts";
import { makeCity } from "../helpers/test-utils.ts";

describe("unitLabel", () => {
  test("celsius usa °C", () => {
    expect(unitLabel("celsius")).toBe("°C");
  });

  test("fahrenheit usa °F", () => {
    expect(unitLabel("fahrenheit")).toBe("°F");
  });
});

describe("cityLabel", () => {
  test("incluye admin1 y país", () => {
    expect(cityLabel(makeCity({ name: "Madrid", admin1: "Madrid", country: "España" }))).toBe(
      "Madrid (Madrid, España)",
    );
  });

  test("solo país cuando falta admin1", () => {
    const city = makeCity({ name: "Lima", admin1: undefined, country: "Perú" });
    expect(cityLabel(city)).toBe("Lima (Perú)");
  });

  test("solo nombre cuando falta región", () => {
    const city = makeCity({ name: "Utopía", admin1: undefined, country: undefined });
    expect(cityLabel(city)).toBe("Utopía");
  });
});
