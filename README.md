# Registro de Estado v7 — PWA

Aplicación web estática para seguimiento longitudinal de sueño, estado, contexto, eventos y funcionamiento.

## Cambios principales
- Múltiples registros por día; cada observación tiene ID propio y hora opcional.
- Tipo de registro: diario o evento/episodio.
- Duración del evento.
- Escalas 1–5 con anclajes descriptivos para mejorar consistencia.
- Calidad de sueño, necesidad de dormir, menor necesidad y sensación de descanso.
- Funcionamiento global.
- Contexto: trabajo, universidad, cafeína, nicotina, sustancias, cambios de medicación, estresores y conflictos interpersonales.
- Campo para describir qué ocurrió antes del cambio.
- Patrones por convergencia de variables, no solo conteos aislados.
- Informe y PDF.
- Exportación JSON/CSV usando el menú de compartir de iOS cuando está disponible.
- Mantiene la clave de almacenamiento `estadoTrackerV3` para conservar los registros existentes.
- Sin PIN/biometría.

## Privacidad
Los registros permanecen en el almacenamiento local del navegador/PWA. GitHub Pages aloja el código, no los registros.

## GitHub Pages
Sube el contenido de esta carpeta a la raíz de la rama `main` y usa GitHub Pages con `Deploy from a branch` → `main` → `/(root)`.
