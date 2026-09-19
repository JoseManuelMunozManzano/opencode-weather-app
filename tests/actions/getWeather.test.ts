import { describe, test, expect, afterEach } from "bun:test";
import { handleAll, handleDefault, showWeather } from "../../src/actions/getWeather.ts";
import { makeCity, makeStore, stubFetch, captureConsole } from "../helpers/test-utils.ts";

let restoreFetch: (() => void) | undefined;

afterEach(() => {
  restoreFetch?.();
  restoreFetch = undefined;
});

describe("showWeather", () => {
  test("imprime temperatura con unidad", async () => {
    restoreFetch = stubFetch(
      () => new Response(JSON.stringify({ current: { temperature_2m: 19 } }), { status: 200 }),
    );
    const { lines, restore } = captureConsole();
    try {
      await showWeather(makeCity({ name: "Madrid" }), "celsius");
      expect(lines.join("\n")).toContain("19°C");
      expect(lines.join("\n")).toContain("Madrid");
    } finally {
      restore();
    }
  });

  test("error de red imprime mensaje sin lanzar", async () => {
    restoreFetch = stubFetch(() => new Response("x", { status: 500 }));
    const { lines, restore } = captureConsole();
    try {
      await showWeather(makeCity({ name: "Madrid" }), "celsius");
      expect(lines.join("\n")).toContain("no se pudo obtener el clima");
    } finally {
      restore();
    }
  });
});

describe("handleDefault", () => {
  test("sin default avisa", async () => {
    const { lines, restore } = captureConsole();
    try {
      await handleDefault(makeStore({ cities: [makeCity()], defaultCity: undefined }));
      expect(lines.join("\n")).toContain("No hay ciudad default");
    } finally {
      restore();
    }
  });

  test("default no registrada avisa", async () => {
    const { lines, restore } = captureConsole();
    try {
      await handleDefault(makeStore({ cities: [makeCity({ name: "Lima" })], defaultCity: "Madrid" }));
      expect(lines.join("\n")).toContain("ya no está registrada");
    } finally {
      restore();
    }
  });

  test("default válida consulta clima", async () => {
    restoreFetch = stubFetch(
      () => new Response(JSON.stringify({ current: { temperature_2m: 22 } }), { status: 200 }),
    );
    const { lines, restore } = captureConsole();
    try {
      await handleDefault(makeStore({ cities: [makeCity({ name: "Madrid" })], defaultCity: "Madrid" }));
      expect(lines.join("\n")).toContain("22°C");
    } finally {
      restore();
    }
  });
});

describe("handleAll", () => {
  test("sin ciudades avisa", async () => {
    const { lines, restore } = captureConsole();
    try {
      await handleAll(makeStore({ cities: [] }));
      expect(lines.join("\n")).toContain("No hay ciudades");
    } finally {
      restore();
    }
  });

  test("recorre todas las ciudades", async () => {
    let calls = 0;
    restoreFetch = stubFetch(() => {
      calls += 1;
      return new Response(JSON.stringify({ current: { temperature_2m: 10 + calls } }), { status: 200 });
    });
    const { lines, restore } = captureConsole();
    try {
      await handleAll(
        makeStore({ cities: [makeCity({ name: "A" }), makeCity({ name: "B" })], defaultCity: "A" }),
      );
      expect(calls).toBe(2);
      expect(lines).toHaveLength(2);
    } finally {
      restore();
    }
  });
});
