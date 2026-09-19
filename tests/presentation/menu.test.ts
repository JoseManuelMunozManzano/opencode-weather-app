import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { Store } from "../../src/types/City.ts";

const baseStore: Store = { cities: [], unit: "celsius" };

const loadStoreMock = mock(async (): Promise<Store> => ({ ...baseStore }));
const askMock = mock((): string => "9");
const printMenuMock = mock((): void => {});
const toggleUnitMock = mock(async (store: Store): Promise<Store> => store);
const handleDefaultMock = mock(async (): Promise<void> => {});
const handleAllMock = mock(async (): Promise<void> => {});
const handleForecastMock = mock(async (): Promise<void> => {});
const handleAddMock = mock(async (store: Store): Promise<Store> => store);
const handleRemoveMock = mock(async (store: Store): Promise<Store> => store);
const handleSetDefaultMock = mock(async (store: Store): Promise<Store> => store);

mock.module("../../src/storage/citiesStorage.ts", () => ({
  loadStore: loadStoreMock,
  saveStore: mock(async () => {}),
  findCity: mock(() => undefined),
  DATA_PATH: "/tmp/weather-menu-test.json",
  dataDir: () => "/tmp",
}));

mock.module("../../src/storage/settingsStorage.ts", () => ({
  toggleUnit: toggleUnitMock,
}));

mock.module("../../src/presentation/output.ts", () => ({
  printMenu: printMenuMock,
}));

mock.module("../../src/presentation/input.ts", () => ({
  ask: askMock,
  toZeroBasedIndex: (choice: string) => Number(choice) - 1,
  isValidIndex: (index: number, length: number) => Number.isInteger(index) && index >= 0 && index < length,
}));

mock.module("../../src/actions/getWeather.ts", () => ({
  handleDefault: handleDefaultMock,
  handleAll: handleAllMock,
  showWeather: mock(async () => {}),
}));

mock.module("../../src/actions/getForecast.ts", () => ({
  handleForecast7Days: handleForecastMock,
  showForecast7Days: mock(async () => {}),
}));

mock.module("../../src/actions/addCity.ts", () => ({
  handleAdd: handleAddMock,
}));

mock.module("../../src/actions/removeCity.ts", () => ({
  handleRemove: handleRemoveMock,
}));

mock.module("../../src/actions/setDefaultCity.ts", () => ({
  handleSetDefault: handleSetDefaultMock,
}));

beforeEach(() => {
  mock.clearAllMocks();
  loadStoreMock.mockImplementation(async () => ({ ...baseStore }));
  toggleUnitMock.mockImplementation(async (store: Store) => store);
  handleAddMock.mockImplementation(async (store: Store) => store);
  handleRemoveMock.mockImplementation(async (store: Store) => store);
  handleSetDefaultMock.mockImplementation(async (store: Store) => store);
  handleDefaultMock.mockImplementation(async () => {});
  handleAllMock.mockImplementation(async () => {});
  handleForecastMock.mockImplementation(async () => {});
  printMenuMock.mockImplementation(() => {});
});

async function runWithAnswers(answers: string[]): Promise<string[]> {
  const queue = [...answers];
  askMock.mockImplementation(() => queue.shift() ?? "9");
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map((a) => String(a)).join(" "));
  };
  try {
    const { runMenu } = await import("../../src/presentation/menu.ts");
    await runMenu();
  } finally {
    console.log = original;
  }
  return lines;
}

describe("runMenu", () => {
  test("despacha 1, 2 y 6 a handlers de lectura", async () => {
    await runWithAnswers(["1", "2", "6", "9"]);
    expect(handleDefaultMock).toHaveBeenCalledTimes(1);
    expect(handleAllMock).toHaveBeenCalledTimes(1);
    expect(handleForecastMock).toHaveBeenCalledTimes(1);
    expect(printMenuMock.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  test("propaga store actualizado de add/remove/default/toggle", async () => {
    const added: Store = { cities: [], defaultCity: "Lima", unit: "celsius" };
    handleAddMock.mockImplementation(async () => added);
    handleRemoveMock.mockImplementation(async (store: Store) => store);
    handleSetDefaultMock.mockImplementation(async (store: Store) => store);
    toggleUnitMock.mockImplementation(async (store: Store) => ({ ...store, unit: "fahrenheit" }));

    await runWithAnswers(["3", "4", "5", "8", "9"]);

    expect(handleAddMock).toHaveBeenCalledTimes(1);
    expect(handleRemoveMock).toHaveBeenCalledTimes(1);
    expect(handleSetDefaultMock).toHaveBeenCalledTimes(1);
    expect(toggleUnitMock).toHaveBeenCalledTimes(1);
    expect(handleRemoveMock.mock.calls[0]?.[0]).toEqual(added);
  });

  test("opción inválida avisa y opción 9 sale", async () => {
    const lines = await runWithAnswers(["xyz", "9"]);
    const out = lines.join("\n");
    expect(out).toContain("Opción inválida");
    expect(out).toContain("Hasta luego");
  });
});
