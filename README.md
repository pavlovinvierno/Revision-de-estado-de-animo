# Registro de Estado v4

Aplicación web estática para registrar sueño, energía, activación, ánimo, riesgo, disociación, síntomas físicos, conductas y observaciones.

## Novedades v3
- Cronología diaria.
- Filtros por fecha.
- Vista conjunta de sueño, energía, activación, ánimo, irritabilidad, pensamiento, concentración, riesgo y necesidad de dormir.
- Variables específicas para distinguir **horas dormidas** de **necesidad percibida de dormir**.
- Registro de si hubo sensación de menor necesidad de dormir y si se despertó descansado.
- Detección descriptiva de patrones simples.
- Edición indirecta por fecha: guardar otro registro en la misma fecha lo reemplaza.
- Exportación JSON y CSV.
- Importación JSON.
- Todo permanece local en el navegador mediante localStorage.

## GitHub Pages
Sube `index.html`, `styles.css`, `app.js` y `README.md` a un repositorio y activa GitHub Pages desde Settings → Pages.

## Nota
La sección “Patrones” es descriptiva. No diagnostica trastornos ni determina por sí sola que exista un episodio afectivo.


## v3 PWA para iPhone
Esta versión puede instalarse como una aplicación desde Safari:
**Safari → Compartir → Añadir a pantalla de inicio**.

### Guardado automático de formularios
Los datos de un registro que todavía no hayas enviado se guardan como **borrador local automáticamente** mientras escribes. Si cierras Safari, cambias de app o recargas, el formulario puede recuperarse en el mismo dispositivo/navegador.

El registro definitivo continúa guardándose localmente y puede exportarse en JSON/CSV.


## v4 — exportación compatible con iPhone

La exportación JSON y CSV usa la hoja nativa de Compartir de iOS cuando está disponible, para poder elegir **Guardar en Archivos**. En otros navegadores se conserva la descarga tradicional.

Los registros siguen almacenándose localmente en el dispositivo mediante `localStorage`; actualizar los archivos de GitHub no borra los registros existentes porque se conserva la misma clave `estadoTrackerV3`.
