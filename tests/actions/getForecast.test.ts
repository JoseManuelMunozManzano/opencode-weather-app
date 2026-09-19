import { describe, test, expect, afterEach } from "bun:test";
import { handleForecast7Days, showForecast7Days } from "../../src/actions/getForecast.ts";
import { makeCity, makeStore, stubFetch, captureConsole } from "../helpers/test-utils.ts";

let restoreFetch: (() => void) | undefined;

afterEach(() => {
  restoreFetch?.();
  restoreFetch = undefined;
});

const dailyOk = {
  daily: {
    time: ["2026-01-01", "2026-01-02"],
    temperature_2m_min: [8, 9],
    temperature_2m_max: [18, 19],
  },
};

describe("showForecast7Days", () => {
  test("imprime cabecera y filas min/max", async () => {
    restoreFetch = stubFetch(() => new Response(JSON.stringify(dailyOk), { status: 200 }));
    const { lines, restore } = captureConsole();
    try {
      await showForecast7Days(makeCity({ name: "Madrid" }), "celsius");
      const out = lines.join("\n");
      expect(out).toContain("Pronóstico 7 días");
      expect(out).toContain("2026-01-01");
      expect(out).toContain("min");
      expect(out).toContain("max");
      expect(out).toContain("°C");
    } finally {
      restore();
    }
  });

  test("omite filas sin números y no rompe", async () => {
    restoreFetch = stubFetch(
      () =>
        new Response(
          JSON.stringify({
            daily: { time: ["2026-01-01"], temperature_2m_min: [8], temperature_2m_max: [18] },
          }),
          { status: 200 },
        ),
    );
    const { lines, restore } = captureConsole();
    try {
      await showForecast7Days(makeCity(), "fahrenheit");
      expect(lines.join("\n")).toContain("°F");
    } finally {
      restore();
    }
  });

  test("error de API imprime mensaje sin lanzar", async () => {
    restoreFetch = stubFetch(() => new Response("x", { status: 500 }));
    const { lines, restore } = captureConsole();
    try {
      await showForecast7Days(makeCity({ name: "Lima" }), "celsius");
      expect(lines.join("\n")).toContain("no se pudo obtener el pronóstico");
    } finally {
      restore();
    }
  });
});

describe("handleForecast7Days", () => {
  test("sin ciudades avisa", async () => {
    const { lines, restore } = captureConsole();
    try {
      await handleForecast7Days(makeStore({ cities: [] }));
      expect(lines.join("\n")).toContain("No hay ciudades");
    } finally {
      restore();
    }
  });

  test("recorre todas las ciudades", async () => {
    let calls = 0;
    restoreFetch = stubFetch(() => {
      calls += 1;
      return new Response(JSON.stringify(dailyOk), { status: 200 });
    });
    const { restore } = captureConsole();
    try {
      await handleForecast7Days(
        makeStore({ cities: [makeCity({ name: "A" }), makeCity({ name: "B" })] }),
      );
      expect(calls).toBe(2);
    } finally {
      restore();
    }
  });
});
