import { describe, test, expect, afterEach } from "bun:test";
import { geocodeCity } from "../../src/api/geocoding.ts";
import { stubFetch } from "../helpers/test-utils.ts";

let restoreFetch: (() => void) | undefined;

afterEach(() => {
  restoreFetch?.();
  restoreFetch = undefined;
});

describe("geocodeCity", () => {
  test("construye URL y devuelve primer resultado", async () => {
    let seenUrl = "";
    restoreFetch = stubFetch((input) => {
      seenUrl = String(input);
      return new Response(
        JSON.stringify({
          results: [
            { name: "Ottawa", country: "Canadá", admin1: "Ontario", latitude: 45.41117, longitude: -75.69812 },
            { name: "Otro", latitude: 0, longitude: 0 },
          ],
        }),
        { status: 200 },
      );
    });

    const result = await geocodeCity("Ottawa");

    expect(result?.name).toBe("Ottawa");
    expect(result?.latitude).toBe(45.41117);
    expect(seenUrl).toContain("name=Ottawa");
    expect(seenUrl).toContain("count=1");
    expect(seenUrl).toContain("language=es");
    expect(seenUrl).toContain("format=json");
  });

  test("codifica consulta con espacios y acentos", async () => {
    let seenUrl = "";
    restoreFetch = stubFetch((input) => {
      seenUrl = String(input);
      return new Response(JSON.stringify({ results: [] }), { status: 200 });
    });

    await geocodeCity("San José");
    expect(seenUrl).toContain(`name=${encodeURIComponent("San José")}`);
  });

  test("devuelve null sin resultados", async () => {
    restoreFetch = stubFetch(() => new Response(JSON.stringify({}), { status: 200 }));
    await expect(geocodeCity("Inexistente")).resolves.toBeNull();
  });

  test("lanza error con HTTP no-ok", async () => {
    restoreFetch = stubFetch(() => new Response("error", { status: 500 }));
    await expect(geocodeCity("Madrid")).rejects.toThrow("Geocoding HTTP 500");
  });
});
