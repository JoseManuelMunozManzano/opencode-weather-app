import type { Store } from "../types/City.ts";
import { cyan } from "../utils/colors.ts";
import { unitLabel } from "../utils/format.ts";

export function printMenu(store: Store): void {
  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("  1. Clima de ciudad default"));
  console.log(cyan(`  2. Clima de todas las ciudades (${store.cities.length})`));
  console.log(cyan("  3. Buscar y agregar ciudad"));
  console.log(cyan("  4. Eliminar ciudad"));
  console.log(cyan("  5. Establecer ciudad default"));
  console.log(cyan("  6. Pronóstico 7 días (todas las ciudades)"));
  console.log(cyan(`  8. Ajustes (${unitLabel(store.unit)})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan("════════════════════════════════════════"));
}
