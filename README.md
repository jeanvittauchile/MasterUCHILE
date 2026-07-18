# Natación Máster U. de Chile — App de Gestión Deportiva

Implementación completa del [handoff de diseño](design_handoff_natacion_master/README.md): app móvil/web para el equipo máster de natación de la Universidad de Chile, con dos roles (entrenador y nadador).

**Stack:** React Native + Expo (móvil y web, PWA instalable) · Node.js/Express (API) · Supabase (PostgreSQL + RLS) · Vercel (deploy de API y web).

**Desplegado:**
- App web: https://masteruchile.vercel.app
- API: https://masteruchile-api.vercel.app

## Estructura del monorepo

```
app/              Expo (React Native + React Native Web) — la app
server/           API Express (TypeScript)
packages/shared/  Validaciones, reglas de negocio y schemas zod compartidos entre app y server
supabase/         Migraciones SQL + seed de datos de ejemplo
```

## Requisitos

- Node.js 20+ y npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`) y Docker Desktop, si vas a correr Supabase localmente
- Una cuenta de [Supabase](https://supabase.com) y una de [Vercel](https://vercel.com) para desplegar

## 1. Instalación

```bash
npm install   # instala los 3 workspaces (app, server, packages/shared) desde la raíz
```

## 2. Base de datos (Supabase)

### Opción A — proyecto real de Supabase (recomendado para probar con Vercel)

1. Crea un proyecto en [supabase.com](https://supabase.com/dashboard).
2. Enlaza el CLI local al proyecto:
   ```bash
   npx supabase login
   npx supabase link --project-ref <tu-project-ref>
   ```
3. Aplica las migraciones y el seed:
   ```bash
   npx supabase db push          # crea las 11 tablas, funciones y políticas RLS
   npx supabase db execute -f supabase/seed.sql   # carga los datos de ejemplo
   ```
4. En el dashboard, ve a **Settings → API** y copia `Project URL`, `anon public key`, `service_role key` y (en **JWT Settings**) el **JWT Secret** — los necesitas en `server/.env`.

### Opción B — Supabase local (requiere Docker)

```bash
npx supabase start        # levanta Postgres+PostgREST+Studio locales
npx supabase db reset      # aplica migraciones + seed.sql de una vez
npx supabase status        # imprime URL, anon key, service_role key y JWT secret locales
```

### Datos iniciales (`supabase/seed.sql`)

Solo el coach real del equipo — sin nadadores, entrenamientos ni torneos de ejemplo (se usaron datos demo espejo del prototipo para verificar el despliegue end-to-end y luego se eliminaron de la base real; el seed ya no los recrea).

| Usuario | Rol | RUT | PIN |
|---|---|---|---|
| Jean Paull Vitta | coach | `17.691.204-9` | `1932` |

El propio coach da de alta a nadadores, sesiones y torneos reales desde la app (Nadadores → alta individual o importación masiva pegando `Nombre, RUT`, lo que genera un PIN temporal por nadador que cada uno debe cambiar en su primer ingreso; Sesiones → + Nueva sesión; Torneos → + Agregar torneo).

Login con el nombre completo (ej. "Jean Paull Vitta") o el RUT (ej. "17.691.204-9") + el PIN.

## 3. Backend (server/)

```bash
cp server/.env.example server/.env
# completa SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
npm run dev:server        # http://localhost:3001 (desde la raíz del repo)
```

Variables de entorno (`server/.env`, ver `server/.env.example`):

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | Panel → Settings → API |
| `SUPABASE_ANON_KEY` | Panel → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Panel → Settings → API (secreto, nunca exponer al cliente) |
| `SUPABASE_JWT_SECRET` | Panel → Settings → API → JWT Settings. El backend firma sus propios tokens con este secreto para que las políticas RLS de Postgres los acepten. |
| `PORT` | Puerto local (default 3001) |
| `CORS_ORIGIN` | Origen permitido (URL de la app desplegada, o `*` en desarrollo) |
| `APP_JWT_EXPIRES_IN` | Duración del token de sesión (default `12h`) |

## 4. App (app/)

```bash
cp app/.env.example app/.env
# EXPO_PUBLIC_API_URL=http://localhost:3001
npm run dev:app            # abre Expo, presiona 'w' para versión web
```

También puedes usar `npm run ios` / `npm run android` (workspace `app`) con Expo Go, apuntando `EXPO_PUBLIC_API_URL` a una IP accesible desde el dispositivo (no `localhost`).

## 5. PWA (instalable, funciona offline)

La versión web es una PWA completa — instalable desde el navegador tanto en teléfono (Android: menú → "Instalar app"; iOS Safari: compartir → "Agregar a inicio") como en escritorio (ícono de instalar en la barra de direcciones de Chrome/Edge).

Todo lo específico de PWA vive en `app/public/` — Expo (bundler Metro) copia esta carpeta tal cual dentro de `dist/` al exportar (`npx expo export -p web`), y **si existe `app/public/index.html` lo usa como template en vez del que trae por defecto** (ver comentarios en el propio archivo sobre qué NO se puede quitar de ahí: los placeholders `%LANG_ISO_CODE%`/`%WEB_TITLE%`, el `<div id="root">`, y los literales `</head>`/`</body>` que usa Expo para inyectar el bundle, el CSS y los meta tags de `app.json`).

- `app/public/manifest.json` — nombre, colores de marca, `display: "standalone"`, e íconos 192/512 (`any` y `maskable`).
- `app/public/icons/*.png` — generados desde `app/src/assets/logo-natacion.png` (192, 512, 512 maskable con zona segura de ~30% de margen, 192 maskable, apple-touch-icon 180, favicons 16/32). Para regenerarlos si cambia el logo: `node -e` con la librería `sharp` (ver histórico de esta sesión) o cualquier herramienta que genere los mismos 7 tamaños/nombres.
- `app/public/sw.js` — service worker sin dependencias (sin Workbox): *network-first* con fallback a caché para navegación (HTML) y para las llamadas GET a la API (para poder ver datos ya cargados sin conexión); *cache-first* para assets propios con hash en el nombre (`/_expo/`, `/assets/`, `/icons/`). Las escrituras (POST/PATCH/PUT/DELETE) nunca se cachean, siempre van a red. Se registra desde un `<script>` inline en `app/public/index.html`.
- `app/app.json` → bloque `web`: `themeColor`/`backgroundColor`/`description` se inyectan automáticamente como `<meta>` en el HTML final por el propio Expo (no hace falta tocar el HTML para esto).

**Verificado en esta implementación** (no solo "debería andar"): con la app cargada una vez, cortar la red y recargar sigue mostrando el login (shell + JS + fuentes servidos desde caché); `navigator.serviceWorker.ready` resuelve con el worker `activated`; el manifest expone 4 íconos válidos y `display: standalone`.

## 6. Responsive (mobile + desktop)

El diseño es mobile-first (fiel al prototipo original) y se adapta a pantallas grandes sin duplicar pantallas: `app/src/theme/responsive.ts` expone `useIsDesktop()` (breakpoint 900px) y `MAX_CONTENT_WIDTH` (560px), usados en:
- `ScreenLayout` (envuelve casi todas las pantallas): en desktop centra el contenido en una columna de lectura cómoda en vez de estirarlo a todo el ancho de la ventana, y reduce el padding superior del header (pensado para el status bar del teléfono, innecesario en web).
- `AppTabBar` (navegación inferior): en mobile es la barra inferior de siempre; en desktop se convierte en un dock flotante centrado, con el mismo ancho que la columna de contenido.
- `LoginScreen` / `ChangePinScreen` (no usan `ScreenLayout`): su tarjeta central también queda con ancho máximo propio para no estirarse en pantallas anchas.

Los tap targets (botones, teclado PIN, ítems de navegación) ya cumplían ≥44px en el diseño original tomado del handoff; no se tocaron.

## 7. Arquitectura y decisiones clave

- **Autenticación propia, no Supabase Auth**: el login es RUT/nombre + PIN de 4 dígitos (`pin_hash` con bcrypt en `users`), no email/password. El backend firma un JWT con el mismo `SUPABASE_JWT_SECRET` del proyecto (`role: "authenticated"` + claim custom `app_role`), así las políticas RLS de Postgres también autorizan por rol como defensa en profundidad, además de los checks explícitos en la API. Ver `server/src/services/jwt.service.ts` y `supabase/migrations/0004_rls_policies.sql`.
- **Dos clientes Supabase en el backend**: `supabaseAdmin` (service role, bypassa RLS — solo login, import masivo, restaurar PIN y el reporte de torneo que da forma explícita a los datos públicos) y `supabaseForUser` (con el JWT del usuario — todo lo demás, para que RLS se aplique de verdad).
- **Datos sensibles** (`prescripcion_medica`, `contacto_emergencia`): solo accesibles por el propio nadador y su entrenador (RLS + checks de API), nunca expuestos en reportes de torneo. Las restauraciones de PIN y ediciones de datos de salud quedan en `audit_log`.
- **Edad y categoría** se calculan siempre desde `fecha_nacimiento` (nunca se persisten) — ver `packages/shared/src/domain/age.ts`, con corte al 31-dic del año de temporada y bandas de 5 años, replicado del prototipo. La regla de banda exacta queda pendiente de confirmar con la federación (ver `design_handoff_natacion_master/Handoff - Especificacion.dc.html` §10).
- **PB (personal best)**: se recalcula en `server/src/services/results.service.ts` usando la función pura `computePersonalBestId` de `packages/shared` (testeada con Jest).
- **Rate-limiting de login**: persistido en la tabla `login_attempts` (no en memoria del proceso), porque el backend corre como funciones serverless en Vercel sin estado compartido entre invocaciones.

## 8. Tests

```bash
npm test          # unitarios de packages/shared (RUT, PB, edad/categoría, promedios) + tests del server
```

Los tests del server (`server/src/__tests__`) son smoke tests que no requieren una base de datos real (validan health check, middleware de auth y la firma/verificación del JWT propio). Para tests de integración completos contra Postgres real, levanta Supabase local (`npx supabase start`, requiere Docker) y apunta `server/.env` a esa instancia antes de escribir/correr pruebas con `supertest` contra endpoints que sí tocan la base de datos.

## 9. Despliegue en Vercel

Ya desplegado como **dos proyectos Vercel separados** en el equipo `vitta-uchile-s-projects` (así quedó configurado; para redesplegar tras cambios basta con `vercel deploy --prod` desde la raíz del repo estando linkeado al proyecto correspondiente — ver más abajo):

### API — proyecto `masteruchile-api` (https://masteruchile-api.vercel.app)
Es un monorepo (npm workspaces), así que el *Root Directory* del proyecto está seteado a `server` **a nivel de Project Settings** (no alcanza con `server/vercel.json` solo) — esto le dice a Vercel que instale desde la raíz del repo (para resolver `@masteruchile/shared` vía workspaces) y luego compile dentro de `server/`. Dos detalles no obvios que ya están resueltos en el repo:
- `packages/shared` se compila a `dist/` antes de que `server` se compile (root `package.json` tiene un script `postinstall` que corre `npm run build --workspace=@masteruchile/shared`) — Node en el runtime de Vercel no puede ejecutar `.ts` directamente, así que el paquete compartido no puede depender de que su `main` apunte a código fuente sin compilar.
- `server/public/.gitkeep` existe solo para satisfacer el chequeo de "Output Directory" de Vercel en un proyecto que es 100% funciones serverless (sin build de framework real).

Variables de entorno del proyecto (Production): las mismas de `server/.env.example`, con `CORS_ORIGIN` = la URL de la app (`https://masteruchile.vercel.app`).

Redeploy: `vercel link --project masteruchile-api --yes && vercel deploy --prod --yes` desde la raíz del repo.

### App web — proyecto `masteruchile` (https://masteruchile.vercel.app)
*Root Directory* = `app` (a nivel de Project Settings, mismo motivo de monorepo). Build Command `npx expo export -p web`, Output Directory `dist` (seteados en Project Settings; `app/vercel.json` los replica por si despliegas distinto). Variable de entorno: `EXPO_PUBLIC_API_URL` = `https://masteruchile-api.vercel.app`.

Redeploy: `vercel link --project masteruchile --yes && vercel deploy --prod --yes` desde la raíz del repo.

El proyecto Expo queda listo para compilar apps nativas más adelante con [EAS Build](https://docs.expo.dev/build/introduction/) (`app/eas.json` ya incluido), fuera del alcance de este despliegue web inicial.

## 10. Documentación de la API

Todas las rutas (salvo `/auth/login`) requieren `Authorization: Bearer <token>`. Prefijo base: `EXPO_PUBLIC_API_URL` / `SUPABASE`-backed API.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | `{identidad, pin}` → `{token, user}` |
| POST | `/auth/change-pin` | autenticado | `{pinActual?, pinNuevo, pinRepetido}` |
| POST | `/auth/swimmers/:id/restore-pin` | coach | Genera y devuelve un nuevo PIN temporal |
| GET | `/swimmers` | coach | Roster (`?q=` busca por nombre) |
| POST | `/swimmers` | coach | Alta individual → `{id, nombre, pin}` |
| POST | `/swimmers/import` | coach | `{text}` (una línea `Nombre, RUT` por nadador) |
| GET | `/swimmers/:id` | self/coach | Ficha completa + KPIs |
| PATCH | `/swimmers/:id` | self/coach | Actualiza perfil (audita si toca datos de salud) |
| PUT | `/swimmers/:id/featured` | self/coach | `{resultIds}` (máx. 3) |
| GET | `/trainings` | autenticado | `?from=&to=` — RLS filtra por grupo si es nadador |
| POST | `/trainings` | coach | Crea sesión + asistencia inicial |
| GET | `/trainings/:id` | autenticado | Detalle + asistencia |
| PATCH | `/trainings/:id/attendance/me` | swimmer | `{estado: confirmado\|declinado}` |
| PATCH | `/trainings/:id/attendance/:swimmerId` | coach | Marca asistencia real post-sesión |
| GET | `/tournaments` | autenticado | Lista |
| POST | `/tournaments` | coach | Crea torneo |
| GET | `/tournaments/:id` | autenticado | Detalle + reporte de participantes |
| POST | `/tournaments/:id/entries` | coach | Inscribe nadador con pruebas |
| PUT | `/tournaments/:id/entries/me` | swimmer | Marca su propia participación |
| GET | `/results` | autenticado | `?swimmerId=&prueba=` |
| POST | `/results` | autenticado | Registra marca (recalcula PB) |
| GET | `/evaluations` | autenticado | `?swimmerId=` |
| POST | `/evaluations` | coach | Nueva evaluación técnica |
| GET | `/reports/weekly-volume` | coach | Volumen por semana |
| GET | `/reports/attendance` | coach | Asistencia por semana |
| GET | `/reports/tournaments/general` | coach | Ranking de torneos por nadador |
| GET | `/reports/tournaments/general.pdf` | coach | PDF del reporte general |
| GET | `/reports/tournaments/:id.pdf` | coach | PDF del reporte de un torneo |
