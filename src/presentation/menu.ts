import { loadStore } from "../storage/citiesStorage.ts";
import { toggleUnit } from "../storage/settingsStorage.ts";
import { printMenu } from "./output.ts";
import { ask } from "./input.ts";
import { green, red } from "../utils/colors.ts";
import { handleAll, handleDefault } from "../actions/getWeather.ts";
import { handleForecast7Days } from "../actions/getForecast.ts";
import { handleAdd } from "../actions/addCity.ts";
import { handleRemove } from "../actions/removeCity.ts";
import { handleSetDefault } from "../actions/setDefaultCity.ts";

export async function runMenu(): Promise<void> {
  let store = await loadStore();
  while (true) {
    printMenu(store);
    const option = ask("  Selecciona una opción: ");
    switch (option) {
      case "1":
        await handleDefault(store);
        break;
      case "2":
        await handleAll(store);
        break;
      case "3":
        store = await handleAdd(store);
        break;
      case "4":
        store = await handleRemove(store);
        break;
      case "5":
        store = await handleSetDefault(store);
        break;
      case "6":
        await handleForecast7Days(store);
        break;
      case "8":
        store = await toggleUnit(store);
        break;
      case "9":
        console.log(green("  ¡Hasta luego!"));
        return;
      default:
        console.log(red("  Opción inválida. Elige 1, 2, 3, 4, 5, 6, 8 o 9."));
        break;
    }
  }
}
