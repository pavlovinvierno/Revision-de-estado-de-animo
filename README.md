# Registro de Estado v9 — PWA

Aplicación web estática para seguimiento longitudinal de sueño, vigilia, estado, contexto y funcionamiento.

## Cambios principales
- Un solo tipo de observación: no se pide clasificar registros como evento/episodio.
- Sueño registrado como períodos independientes, con fecha y hora de inicio y fin.
- Compatibilidad con sueño que cruza medianoche.
- Tiempo despierto derivado automáticamente a partir del último despertar conocido.
- Vigilia prolongada (≥24 h) visible en cronología, patrones e informe cuando está suficientemente documentada.
- Si existe un intervalo largo sin sueño registrado, la aplicación no lo interpreta automáticamente como vigilia: solicita una revisión opcional.
- La revisión permite indicar: sí dormí, no dormí o no recuerdo. La incertidumbre se conserva como incertidumbre.
- Permite registrar retrospectivamente un sueño olvidado y recalcular la línea temporal.
- Las observaciones de estado no requieren repetir información de sueño.
- Escalas 1–5 con anclajes descriptivos.
- Patrones descriptivos, completitud y cronología.
- Informe imprimible/PDF y exportación JSON/CSV.
- Los datos previos almacenados en `estadoTrackerV3` se conservan; los antiguos campos de sueño se migran automáticamente cuando contienen inicio y fin.

## Privacidad
Los registros permanecen en el almacenamiento local del navegador/PWA. GitHub Pages aloja el código, no los registros.

## GitHub Pages
Sube el contenido de esta carpeta a la raíz de la rama `main` y usa GitHub Pages con `Deploy from a branch` → `main` → `/(root)`.
