# Revisión Weather CLI

- [x] **Colores:** cyan (menú), amarillo (temp), verde/rojo (ok/error).
- [ ] **AGENTS.md:** actualizado para reflejar la app implementada.
- [ ] **Ciudades:** geocoding lista hasta 10 resultados con desambiguación; ciudades claveadas por coordenadas.
- [ ] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [ ] **Carga:** ¿hay estado de carga en las tareas asíncronas?
- [x] **7 day forecast:** pronóstico 7 días (min/max) para todas las ciudades en la opción 6.
