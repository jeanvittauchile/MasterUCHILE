# Handoff: App Gestión Deportiva — Natación Máster U. de Chile

## Overview
Aplicación móvil (iOS/Android) + backend para gestionar el equipo máster de natación de la Universidad de Chile. Dos roles (entrenador y nadador) con perfiles diferenciados. El entrenador gestiona nadadores, entrenamientos (en calendario), torneos, evaluaciones técnicas y reportes; el nadador gestiona su perfil, confirma asistencia, registra tiempos y sigue su progreso y evaluaciones.

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** — prototipos de alta fidelidad que muestran el aspecto y el comportamiento deseados, **no** código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno objetivo** con sus patrones y librerías establecidos:
- **Frontend móvil:** React Native (responsive en teléfono, tablet, desktop)
- **Backend:** Node.js/Express
- **BD y Auth:** Supabase (PostgreSQL + Auth)

El estado del prototipo es en memoria (no persiste) y la seguridad/BD están simuladas en el cliente — todo eso debe implementarse de verdad en el backend.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado e interacciones son definitivos. Recrear la UI fielmente usando las librerías del stack objetivo.

## Design Tokens
**Colores**
- Azul marino primario (U. de Chile): `#0A1F5C`
- Azul secundario (gradientes/acentos): `#123A8F`, `#1E52C7`
- Rojo U. de Chile (acento/CTA): `#DA1E28` (oscuro `#A3141C`)
- Verde éxito/positivo: `#1E9E5A`
- Fondo app: `#EEF1F8`
- Superficie/tarjetas: `#FFFFFF`
- Texto principal: `#0A1F5C`; secundario: `#6B7599`; terciario/placeholder: `#9AA4C0`
- Bordes inputs: `#DBE1F0`; separadores: `#F0F2F8`; pista de barras: `#EEF1F8` / `#E6EAF5`
- Chip info: fondo `#EEF1FB`, texto `#1E52C7`
- Fondo pantalla exterior (marco): degradado radial `#17244D → #0A1024 → #070B1A`

**Tipografía**
- Títulos/números/labels destacados: **Oswald** (500/600/700), a menudo `letter-spacing` .5–2px y UPPERCASE
- Cuerpo/inputs: **Barlow** (400/500/600/700)
- Escala típica: título pantalla 26px/700, título card 15–16px/600–700, KPI 26–38px/700, cuerpo 13.5–14px, label 11–12px

**Radios**: inputs/botones 10–14px · tarjetas 16–20px · pills 999px · marco teléfono 42–52px
**Sombras**: tarjeta `0 4px 14px rgba(16,31,92,.06)` · CTA `0 8px 20px rgba(10,31,92,.25)` · modal `0 8px 24px rgba(16,31,92,.10)`
**Marco dispositivo de referencia**: 392×844 (iPhone). Hit targets ≥44px.

## Roles
- **Entrenador**: alta/importación de nadadores, restaurar PIN, ficha completa (incl. datos de salud), escribir entrenamientos en calendario, torneos+inscripciones, evaluaciones técnicas, reportes.
- **Nadador**: completar/editar perfil, cambiar PIN, confirmar asistencia (grupo AM/PM), registrar tiempos+parciales, ver progreso y evaluación, marcar participación en torneos, destacar mejores marcas.

## Authentication
- Login único: identidad (RUT o nombre) + **PIN de 4 dígitos** con teclado numérico; el sistema enruta según rol.
- PIN **hasheado** (nunca texto plano). Rate-limiting + bloqueo tras N intentos (solo 10.000 combinaciones).
- Alta por entrenador con PIN temporal → nadador debe cambiarlo en primer ingreso (`pin_temporal`).
- Recuperación: nadador pide al entrenador; restauración **auditada**.

## Screens / Views

### Entrenador
1. **Inicio** — próxima sesión (card roja), KPIs (nadadores/asistencia/torneos), gráfico de barras volumen semanal, confirmaciones del día **divididas en grupo AM y PM**.
2. **Nadadores** — buscador, lista con avatar iniciales; **Importar base de datos** (pegar `Nombre, RUT` → genera PIN automático y los lista); etiqueta "Perfil pendiente" para importados.
3. **Ficha nadador** — gestión de PIN (ver/ocultar/restaurar), KPIs, ficha completa, prescripción médica en bloque confidencial rojo, gráfico de evolución por prueba (selector de chips).
4. **Sesiones** — **calendario mensual** con puntos AM(rojo)/PM(azul); crear entrenamiento (día, distancia, enfoque, grupo AM/PM/Ambos, plan serie por serie en textarea); tap a un día filtra sus sesiones; detalle con set principal.
5. **Evaluar** — lista con puntaje promedio + última fecha; detalle con **gráfico radar** (Libre, Espalda, Pecho, Mariposa, Virajes, Salidas), promedio /10, nota, historial con barras; nueva evaluación con sliders 1–10 + observaciones.
6. **Torneos** — agregar/quitar; inscribir nadadores por prueba; reporte por torneo (total participantes, inscripciones a pruebas, lista con categoría) + **reporte general** (total torneos + participación acumulada por nadador).
7. **Reportes** — volumen, asistencia por semana, resumen general de torneos por nadador, acceso a reportes por torneo, exportar PDF.

### Nadador
1. **Inicio** — próximo entrenamiento (acceso a confirmar), asistencia, PBs del ciclo, próximo torneo, **3 mejores marcas destacadas** (editables por el nadador, hasta 3).
2. **Sesiones** — entrenamientos asignados con estado de confirmación + etiqueta de grupo; detalle con botones **Confirmar / No puedo**.
3. **Progreso** — gráfico de **evolución por prueba** (chips selector); **mi evaluación técnica** (radar, solo lectura); registrar marca (formato **00:00.0** con máscara + parciales cada 25/50 m); tap a marca → gráfico de evolución de esa prueba + historial con parciales.
4. **Torneos** — mis torneos; marcar participación (pasados/presentes).
5. **Perfil** — datos personales, perfil deportivo (2 estilos, 2 pruebas fav., grupo AM/PM), salud/emergencia (sensible), cambiar PIN (nuevo + repetir, validación), guardar/cerrar sesión.

## Interactions & Behavior
- Navegación por bottom nav (entrenador 6 tabs; nadador 5 tabs) + vistas de detalle con botón atrás en el header.
- Formularios con validación en vivo: RUT (dígito verificador módulo 11), PIN (4 dígitos + coincidencia), tiempo (máscara `m:ss.d`).
- PB detectado automáticamente al registrar el mejor tiempo por prueba.
- Sliders de evaluación 1–10 (paso .5); radar y promedio se recalculan.
- Gráficos: barras y líneas en SVG; radar en SVG (6 ejes, anillos 25/50/75/100%).

## State Management
Variables clave por implementar (ver `Handoff - Especificacion` §6 para el modelo): usuario/rol/sesión, roster de nadadores, sesiones+confirmaciones, torneos+inscripciones+participación, tiempos+parciales+PB, evaluaciones, PINs. Reglas: edad y categoría **calculadas** (no columnas), corte al 31-dic del año en curso, bandas máster de 5 años; tiempos en centésimas (int); "última evaluación" ordenada por fecha real.

## Data Model
Ver el documento `Handoff - Especificacion.dc.html` §6 (10 tablas: users, swimmer_profiles, trainings, training_attendance, tournaments, tournament_entries, results, evaluations, audit_log). Usar RLS de Supabase + checks en la API para autorización por rol. Datos de salud (prescripción médica, contacto emergencia) sensibles: Ley 19.628 (Chile) — consentimiento, acceso restringido (nadador + su entrenador), nunca en reportes de torneo.

## Quality (producción)
- Validación en frontend y backend.
- Tests unitarios (edad/categoría, RUT, PB, promedios) e integración (login/PIN, alta+importación, confirmación asistencia, inscripción torneo, evaluación).
- Manejo de errores + estados vacíos en cada pantalla.
- README con variables de entorno, instalación, setup Supabase (migraciones+seeds), documentación de API.

## Assets
- `assets/logo-natacion.png` — logo U Natación Máster (azul marino/rojo/blanco). Usar como logo de la app.
- Iconos: dibujados como paths SVG inline (home, users, dumbbell, trophy, chart, user, clipboard) — reemplazar por el set de iconos del codebase.
- Sin imágenes externas; gráficos generados en SVG.

## Screenshots
En `screenshots/`: 01–06-coach (Inicio, Nadadores, Sesiones/calendario, Evaluar, Torneos, Reportes) y 01–04-swimmer (Inicio, Progreso, Perfil, Login).

## Files
- `Natacion Master.dc.html` — prototipo interactivo completo (referencia visual y de comportamiento; ábrelo en navegador). Toda la lógica de UI y datos de ejemplo están aquí.
- `Handoff - Especificacion.dc.html` — especificación funcional y de datos imprimible (roles, pantallas, modelo de datos, reglas, seguridad).
- `assets/logo-natacion.png` — logo.

> Nota: los `.dc.html` son referencias de diseño. Recrear en React Native + Node/Express + Supabase siguiendo los patrones del proyecto; no portar el HTML directamente.
