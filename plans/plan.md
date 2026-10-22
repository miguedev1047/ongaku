# Plan: corregir la landing, responsive, traducciones y datos de releases

> **Instrucciones para el ejecutor:** este documento es un plan de implementación para el commit `30956e2` (`feat(web): redesign landing page with animated screenshot marquee`). Ejecuta las fases y verificaciones en orden. No edites el test `apps/web/src/features/landing/tests/screenshot-marquee.test.ts` para colocar UI: el nombre indicado por la solicitud corresponde al componente/sección del marquee, no al archivo de pruebas.

## Objetivo

Corregir la experiencia frontend en dos fases:

1. Completar la migración de textos visibles a i18n, recuperar la tarjeta minimalista de features debajo del marquee y hacer que la landing web funcione correctamente en móvil, tablet y escritorio.
2. Usar TanStack Query para obtener la última release, precargarla y consumirla con `useSuspenseQuery`; generar dinámicamente el enlace al binario adecuado, refrescando la query cada minuto, y aplicar límites de Suspense con skeletons en consumidores que dependan de datos asíncronos.

## Estado actual confirmado

- `apps/web/src/routes/index.tsx:33-45` compone `Hero`, `ScreenshootMarquee` y `ReleaseSection`, pero no renderiza `FeatureStrip`.
- `apps/web/src/features/landing/components/feature-strip.tsx:10-42` ya contiene los cuatro features traducibles (`landing.features.*`) y un grid responsive. Debe reutilizarse y simplificarse visualmente, no duplicarse.
- `apps/web/src/features/landing/components/screenshot-marquee.tsx:8-26` fija la altura del marquee en `75vh` y usa `py-32`; estas decisiones deben revisarse para pantallas estrechas y alturas pequeñas.
- `apps/web/src/features/landing/components/release-section.tsx:9,49-53` usa `LATEST_RELEASE_URL`, que hoy es la página `/releases/latest`, no un asset binario concreto.
- `apps/web/src/features/landing/constants.ts:16-28` contiene URLs, título y descripción visibles hardcodeados. Distinguir constantes técnicas/SEO de copy traducible; el copy visible y los atributos accesibles deben salir de i18n.
- `apps/web/src/routes/__root.tsx:43-68` inicializa el documento web y sincroniza idioma. La raíz usa `lang='en'`; actualmente eso fija el idioma del HTML durante SSR y solo `useLanguageSync` lo corrige después de hidratar.
- `apps/web/src/hooks/language-sync.ts:9-37` solo puede leer `localStorage` dentro de `useEffect`, por lo que no resuelve el idioma durante SSR, aunque sí escucha cambios posteriores de i18next y actualiza `document.documentElement.lang` en cliente.
- `apps/web/src/lib/i18n.ts:18-33` inicializa un singleton i18next en inglés. La solución SSR debe evitar mutar un singleton compartido entre requests con idiomas distintos; usar una instancia/configuración por request o un mecanismo server-safe equivalente de TanStack Start.
- `apps/web/src/locales/en.json` y `apps/web/src/locales/es.json` son las fuentes de traducción web. Mantener las mismas claves y forma en ambos idiomas.
- `apps/web/package.json:19-21` ofrece `test`, `typecheck`; `:16-18` ofrece `lint` y `check`. Web actualmente no declara `@tanstack/react-query`.
- `apps/desktop/src/lib/query.tsx:1-16` ya crea el `QueryClient`; `apps/desktop/src/main.tsx:25-40` lo inyecta al router y al `QueryProvider`.
- `apps/desktop/src/routes/__root.tsx:31-38` ya precarga con `context.queryClient.query(...)`; los consumidores existentes muestran el patrón de `useSuspenseQuery`, por ejemplo `apps/desktop/src/features/library/components/stats.tsx:1-14`.
- `apps/desktop/src/features/download-queue/components/cards/download-queue-warn-card.tsx:19-31` no consume ninguna query: recibe `task` por props y solo traduce el mensaje de error. No añadir una query a este componente sin una dependencia real; el boundary de Suspense debe envolver al componente que sí consuma datos.
- `apps/desktop/src/features/download-queue/hooks/use-binaries.ts:11-44` ya usa `useSuspenseQuery(systemHealthQueryOpts())` y el estado de instalación de binarios. No reemplazar este flujo con la API de GitHub sin justificar el contrato.
- `apps/desktop/src/features/settings/queries/updates.ts:19-26` es el ejemplo existente de `queryOptions`, `staleTime`, `refetchInterval` y `refetchOnWindowFocus`.
- `apps/desktop/src/features/*/ui-state/loading-state.tsx` y `@ongaku/ui` proporcionan `Skeleton`; imitar sus clases y usar `Suspense fallback={<...Skeleton />}` en lugar de spinners genéricos cuando el consumidor espere una query.

## Restricciones del repositorio

- Usar Bun: no usar npm, pnpm ni yarn.
- Imports internos desde `src/` mediante alias `@/*`; no introducir imports relativos ascendentes.
- La UI, los `aria-label`, `title`, `alt`, errores y toasts deben estar en inglés mediante claves de traducción; agregar las traducciones españolas equivalentes en `es.json`.
- Usar `Show` para renderizado condicional JSX, nunca ternarias JSX.
- Usar `cn` para clases dinámicas o concatenadas.
- No usar `rounded-full`, tamaños hardcodeados de iconos ni `ensureQuery`.
- Respetar los componentes de `@ongaku/ui` y los tokens Tailwind existentes.
- No modificar `apps/web/src/features/landing/tests/screenshot-marquee.test.ts` salvo que un cambio deliberado en el algoritmo requiera actualizar una expectativa; el layout de UI se implementa en componentes/rutas.

## FASE 1 — landing y responsive

### 1. Auditar y completar i18n

1. Buscar en `apps/web/src/**/*.{ts,tsx}` todos los strings visibles: títulos, botones, descripciones, `alt`, `aria-label`, `title`, placeholders y mensajes de error. Excluir identificadores técnicos, nombres de rutas, claves i18n, URLs y constantes internas.
2. Añadir claves a `apps/web/src/locales/en.json` y las traducciones correspondientes a `apps/web/src/locales/es.json`, agrupadas por namespace (`common`, `navigation`, `landing`, `downloads`, `footer`). Reutilizar `landing.features.*` para `FeatureStrip`.
3. Cambiar los componentes de landing (`hero.tsx`, `feature-strip.tsx`, `screenshot-marquee.tsx`, `release-section.tsx`, `site-header.tsx`, `site-footer.tsx`, `language-switcher.tsx`) para obtener copy mediante `useTranslation`. Mantener URLs técnicas en constantes, pero no mantener copy visible en `constants.ts`.
4. Corregir los tests de i18n en `apps/web/src/shared/tests/i18n.test.ts` para comprobar que las claves nuevas existen y que inglés/español no devuelven la clave sin traducir.
5. Añadir una función pura para resolver el idioma inicial de SSR con este orden: cookie de idioma válido, `Accept-Language` compatible y finalmente `en`. Validar siempre contra `supportedLanguages`; nunca usar directamente un header del cliente como `lang`.
6. Cambiar `apps/web/src/routes/__root.tsx` para que el `<html lang>` inicial sea el idioma resuelto en SSR, no un literal `'en'`. El mismo valor debe estar disponible durante el render del shell y no depender de `window`/`localStorage`.
7. Mantener `useLanguageSync` para hidratar el idioma persistido en cliente y escuchar `languageChanged`, pero hacerlo compatible con el valor SSR: no provocar un cambio innecesario durante la hidratación y actualizar inmediatamente `document.documentElement.lang` cuando el usuario cambia de idioma.
8. Persistir la selección del usuario en una cookie además de `localStorage` (o definir una estrategia equivalente) para que la siguiente respuesta SSR pueda renderizar el idioma elegido. Usar `Path=/`, `SameSite=Lax` y `Secure` cuando corresponda.
9. Revisar `head()`/metadatos de la ruta raíz: el copy localizado debe usar el mismo idioma SSR; las constantes técnicas y URLs pueden permanecer estáticas.

**Verificación:** `bun --filter web test -- src/shared/tests/i18n.test.ts` debe terminar con todas las pruebas exitosas.

### 1.b. Asegurar idioma dinámico y SSR del documento HTML

Este requisito debe quedar resuelto aunque la release remota falle.

1. Identificar en la API de TanStack Start usada por el proyecto cómo acceder a headers/cookies durante SSR y cómo pasar datos del loader al `shellComponent`. No leer `window`, `localStorage` ni `document` durante SSR.
2. Implementar la resolución inicial como función pura y testeable. Si se mantiene un singleton i18next en servidor, detenerse antes de mutarlo globalmente: crear una instancia aislada por request o garantizar que requests simultáneos `en`/`es` no se contaminen.
3. Hacer que `RootDocument` reciba el idioma inicial y lo aplique a `<html lang={language}>`. Conservar `suppressHydrationWarning` solo si existe una diferencia deliberada y testeada.
4. Extender `useLanguageSync` para sincronizar i18next, `document.documentElement.lang` y cookie/localStorage. Registrar y limpiar el listener de `languageChanged` correctamente.
5. Actualizar `language-switcher.tsx` para cambiar idioma mediante una única función compartida que actualice la persistencia; no duplicar lógica de cookies.
6. Añadir pruebas para cookie válida, cookie inválida, `Accept-Language: es`, header ausente y fallback inglés; comprobar también que el HTML SSR con español empieza con `<html lang="es">` y que un cambio posterior actualiza el atributo a `en`.

**Verificación:** `bun --filter web test -- src/shared/tests/i18n.test.ts src/features/landing/tests` y `bun --filter web build` deben pasar sin warnings de hidratación relacionados con `lang` o traducciones.

### 2. Recuperar la feature card de forma minimalista

1. En `apps/web/src/routes/index.tsx`, importar `FeatureStrip` y renderizarlo inmediatamente después de `<ScreenshootMarquee />` y antes de `<ReleaseSection />`.
2. Simplificar `feature-strip.tsx` para aproximarlo a la referencia adjunta: seis elementos en un grid de tres columnas en desktop (por ejemplo, `Every process`, `Processors, core by core`, `Memory and pressure`, `Graphics, disks, network`, `Energy and heat`, `In the menu bar`) solo si ese es el copy final de producto; si los cuatro features actuales son los definitivos, conservar sus claves y representar los cuatro sin inventar contenido. La decisión debe quedar reflejada en las traducciones, no en strings JSX.
3. El diseño debe ser minimalista: indicador de color, título y párrafo corto; sin card individual pesada ni iconos grandes. Usar un grid que pase a una columna en móvil y a dos/tres columnas en tamaños mayores, con divisores y padding coherentes con el tema.
4. Si se requieren seis features nuevos, agregar claves estables y traducciones en ambos idiomas; no eliminar las claves actuales hasta confirmar que ningún otro componente las usa.

**Verificación:** ejecutar `bun --filter web test -- src/features/landing/tests` y comprobar que el DOM de la ruta contiene la sección de features después del marquee, sin modificar las invariantes del test de layout.

### 3. Corregir responsive de la landing

Revisar `hero.tsx`, `site-header.tsx`, `screenshot-marquee.tsx`, `feature-strip.tsx`, `release-section.tsx` y `site-footer.tsx` en anchos aproximados de 320, 375, 768, 1024 y 1440 px, además de alturas pequeñas. Aplicar, según proceda:

- evitar overflow horizontal y anchos mínimos no intencionados;
- hacer que navegación, botones y controles de idioma puedan envolver o colapsar sin quedar fuera de pantalla;
- usar padding y tipografía escalables (`sm`, `md`, `lg`) y botones a ancho completo en móvil;
- sustituir la altura rígida de `75vh` del marquee por límites responsive (`min/max` o clases por breakpoint), manteniendo legibilidad y rendimiento;
- asegurar que la sección de features y la lista de plataformas de release no fuerzan columnas demasiado estrechas;
- mantener targets táctiles, foco visible, contraste y `alt`/labels traducidos;
- respetar `prefers-reduced-motion` donde ya exista soporte, sin añadir animaciones nuevas obligatorias.

Crear o ampliar una prueba de render responsive solo si ya existe una infraestructura adecuada; no intentar probar geometría CSS exacta con Vitest. La verificación visual se hará mediante `bun --filter web dev:web` y revisión manual en los cinco anchos indicados.

**Verificación:** `bun --filter web check && bun --filter web lint && bun --filter web typecheck && bun --filter web test` debe terminar con código 0.

## FASE 2 — query de release, preload y Suspense

### 4. Definir el contrato de la última release

1. Elegir una única fuente para la landing: la API pública de GitHub `GET https://api.github.com/repos/miguedev1047/ongaku/releases/latest`, o un endpoint server-side de TanStack Start que la proxye. Preferir server-side para evitar CORS, rate limits expuestos y respuestas inconsistentes del navegador.
2. Definir un tipo mínimo para la respuesta: `tag_name`, `html_url`, `name` opcional y `assets[]` con `name` y `browser_download_url`. Validar la respuesta antes de usarla; nunca interpolar nombres de asset sin validar.
3. Definir una función pura para seleccionar el asset por plataforma/arquitectura. Debe cubrir los nombres reales documentados en `README.md:31-37` (Windows `.exe`, macOS x64/aarch64 `.dmg`, Linux `.AppImage`/`.deb`) y tener fallback seguro a `html_url` si no existe un asset compatible.
4. No confundir el enlace de la página de release (`RELEASES_URL`/`html_url`) con el enlace del binario. El CTA principal debe usar el `browser_download_url` seleccionado; “All releases” debe seguir apuntando a la página de releases.

**Verificación:** añadir tests unitarios en `apps/web/src/features/landing/tests/` para selección de Windows, macOS Intel/Apple Silicon, Linux, asset ausente y respuesta sin assets. La función debe ser determinista y no depender de `window`.

### 5. Integrar TanStack Query en web con preload

1. Añadir `@tanstack/react-query` a `apps/web/package.json` usando la versión compatible con el lockfile y Bun; no editar `bun.lock` manualmente. Si el paquete ya está transitivamente disponible, confirmar versión antes de duplicar la dependencia.
2. Crear el `QueryClient` y `QueryClientProvider` web siguiendo el patrón de `apps/desktop/src/lib/query.tsx`, con `refetchOnWindowFocus: false` solo si es coherente con el comportamiento de la landing.
3. Crear query options dedicadas, por ejemplo en `apps/web/src/features/landing/queries/latest-release.ts`, con key estable, función de fetch validada, `staleTime` apropiado y `refetchInterval: 60_000`. El intervalo debe ser exactamente un minuto y seguir activo solo mientras haya un consumidor montado.
4. Integrar el query client al contexto de TanStack Router/Start. En el loader de la ruta `/`, usar `context.queryClient.query(latestReleaseQueryOpts())` (no `ensureQuery`) para precargar antes de renderizar; el loader no debe romper la página si GitHub está temporalmente inaccesible: debe existir una estrategia de error/fallback documentada y traducida.
5. En `release-section.tsx` y cualquier otro consumidor real, usar `useSuspenseQuery(latestReleaseQueryOpts())`. Mantener la renderización del CTA en un componente separado si hace falta para que `Suspense` tenga un límite pequeño.
6. Envolver el consumidor con `<Suspense fallback={<ReleaseSectionSkeleton />}>`, reutilizando `Skeleton` de `@ongaku/ui` y respetando la composición visual de la sección. Añadir un `ErrorBoundary` o estado de error con enlace manual a `RELEASES_URL`; el error no debe dejar una pantalla en blanco.

**Verificación:** `bun --filter web typecheck`, `bun --filter web test` y `bun run build:web` deben finalizar correctamente. Un test de query debe comprobar que `refetchInterval` vale `60_000`, que el loader precarga la misma key y que el componente no accede a `data` antes de resolver Suspense.

### 6. Aplicar el patrón de Suspense al desktop solo donde corresponda

1. Auditar los consumidores desktop incluidos en el cambio de datos. Convertir únicamente queries que realmente puedan suspender a `useSuspenseQuery`; no cambiar componentes que solo reciben props ni acciones/mutaciones.
2. Para cada consumidor, colocar el `Suspense` en su padre visual más pequeño y usar un skeleton específico. En particular, `download-queue-warn-card.tsx` no debe recibir una query artificial: si un padre de la cola obtiene datos remotos necesarios, envolver ese padre o la lista; mantener la tarjeta como componente presentacional.
3. Modelar el skeleton a partir de `Attachment`/layout de la tarjeta y reutilizar `Skeleton`; no usar `rounded-full`, tamaños de icono explícitos ni strings hardcodeados.
4. Si se modifica una query desktop para refrescar releases o estado relacionado, añadir `refetchInterval: 60_000` solo a esa query, no globalmente a todas las queries del `QueryClient`. Mantener la invalidación existente tras instalar binarios.

**Verificación:** `bun --filter desktop typecheck && bun --filter desktop lint && bun --filter desktop test && bun --filter desktop check:platform` debe finalizar con código 0. Confirmar además que `download-queue-warn-card.tsx` sigue pudiendo renderizarse con un `DownloadTask` sin provider de queries.

## Alcance

### Archivos que probablemente se modificarán

- `apps/web/package.json` y `bun.lock` (solo mediante Bun si se añade la dependencia).
- `apps/web/src/routes/index.tsx`, `apps/web/src/routes/__root.tsx` y la configuración/provider de query web que determine la arquitectura actual.
- `apps/web/src/features/landing/components/{hero,feature-strip,screenshot-marquee,release-section,site-header,site-footer,language-switcher}.tsx`.
- `apps/web/src/features/landing/constants.ts` y una nueva query/selector de release dentro de `apps/web/src/features/landing/`.
- `apps/web/src/locales/{en,es}.json`.
- Tests bajo `apps/web/src/features/landing/tests/` y `apps/web/src/shared/tests/`.
- Solo los consumidores desktop que se demuestre que dependen del nuevo dato async y sus estados de carga asociados.

### Fuera de alcance

- No modificar Rust/Tauri, comandos IPC, `platform.types.ts`, `tauri.conf.json` ni el updater nativo.
- No cambiar el algoritmo de `marquee-layout.ts` ni las expectativas del test de layout sin una regresión reproducible.
- No migrar todas las queries desktop de `useQuery` a `useSuspenseQuery` como limpieza general.
- No implementar autenticación GitHub, uploads, cache persistente ni un sistema de releases nuevo.
- No poner tokens, secrets ni URLs privadas en el bundle.

## Tests y criterios de finalización

- [ ] `bun --filter web test` pasa, incluyendo i18n, marquee, selector de asset y tests de la sección de landing.
- [ ] `bun --filter web typecheck`, `bun --filter web lint` y `bun --filter web check` pasan.
- [ ] `bun run build:web` pasa sin errores SSR/cliente ni warnings nuevos de hidratación.
- [ ] `bun --filter desktop typecheck`, `bun --filter desktop lint`, `bun --filter desktop test` y `bun --filter desktop check:platform` pasan si se tocaron archivos desktop.
- [ ] El CTA principal descarga el asset compatible de la última release; si falta, abre la página de release como fallback.
- [ ] La query usa una key estable, preload con `query`, `useSuspenseQuery` en consumidores y `refetchInterval: 60_000`.
- [ ] La landing no presenta overflow horizontal en 320–1440 px y la feature strip aparece inmediatamente debajo del marquee.
- [ ] No quedan textos visibles hardcodeados en los componentes web auditados ni claves faltantes en `en.json`/`es.json`.
- [ ] `git status --short` muestra únicamente archivos incluidos en el alcance.

## Condiciones para detenerse y reportar

- El código de TanStack Start no permite un fetch server-side seguro sin cambiar archivos fuera de alcance: detenerse y proponer el endpoint/contexto exacto.
- Los nombres reales de los assets de GitHub no coinciden con los patrones del README: detenerse y pedir la matriz de nombres/arquitecturas, sin adivinar enlaces.
- La respuesta de GitHub requiere credenciales, está bloqueada por rate limit o tiene un esquema incompatible: conservar fallback a releases y reportar el contrato observado.
- El estado actual de cualquier archivo citado difiere sustancialmente del plan: actualizar el plan antes de implementar.
- Una verificación falla dos veces o exige tocar Rust/Tauri, componentes compartidos fuera del alcance o contratos públicos: detenerse y reportar.

## Mantenimiento

- Si GitHub cambia los nombres de assets, actualizar el selector y sus fixtures antes de cambiar la UI.
- Mantener el intervalo de un minuto limitado a la query de release; no convertirlo en una política global que provoque tráfico innecesario.
- Revisar especialmente SSR/hidratación, fallback offline, selección de arquitectura macOS y accesibilidad del CTA en la revisión del cambio.
- La tarjeta de warning de download queue debe seguir siendo presentacional; futuras dependencias remotas deben exponerse desde hooks/queries y suspenderse en un padre explícito.
