# Reglas de Desarrollo y Estilo - Ongaku

## 🎨 Estilos y Clases Condicionales (`cn`)

- **Uso Obligatorio de `cn`**: Al aplicar clases condicionales, dinámicas o concatenaciones en `className`, **siempre forzar el uso de la función `cn`** (importada desde `"cn"`).
- **Ejemplo canónico**:
  ```tsx
  import { cn } from "cn"

  <div
    className={cn(
      `fixed left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-lg px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`,
      bottomClass
    )}
  >
  ```
- **Sin interpolaciones directas sin `cn`**: Evitar concatenaciones manuales como `${baseClass} ${condition ? 'active' : ''}`; usar siempre `cn(...)`.

---

## 🔀 Renderizado Condicional (`Show`)

- **Prohibido el uso de ternarias en JSX**: Evitar el uso de operadores ternarios en JSX (`condicion ? <ComponentA /> : <ComponentB />`) para renderizado condicional.
- **Uso Obligatorio de `<Show>`**: Utilizar siempre el componente `Show` (importado desde `@/components/utility/show`).
- **Sustitución de ternarias mediante `fallback`**:
  ```tsx
  import { Show } from '@/components/utility/show'

  // ❌ EVITAR (Ternaria):
  // {hasPlaylists ? <PlaylistsList /> : <EmptyPlaylists />}

  // ✅ CORRECTO (Uso canónico de Show con fallback):
  ;<Show
    when={hasPlaylists}
    fallback={<EmptyPlaylists />}
  >
    <PlaylistsList />
  </Show>
  ```
- **Evaluación perezosa con render prop (children como función)**:
  En React, los hijos JSX normales se evalúan antes de pasarse al componente. Cuando los hijos dependan de que `when` no sea nulo o indefinido, **usar una función como hijo** para prevenir errores de acceso a propiedades en `null`/`undefined`:
  ```tsx
  // ✅ Pasa una función si el hijo depende de la existencia del objeto
  <Show
    when={selectedUser}
    fallback={<p>No user selected</p>}
  >
    {(user) => <UserProfile name={user.name} />}
  </Show>
  ```

---

## 📐 Reglas Generales de Arquitectura y Diseño

1. **Rutas de Importación**:
   - Usar estrictamente alias `@/*` para todas las importaciones internas dentro de `src/`.
   - Prohibido el uso de importaciones relativas a directorios superiores (`../`).

2. **Radios de Borde**:
   - Prohibido el uso de `rounded-full` en cualquier parte de `src/`.
   - Utilizar la escala de bordes definida por el tema (`rounded-sm`, `rounded-md`, `rounded-lg`).

3. **Idioma de la Interfaz**:
   - Todo el contenido de cara al usuario en la UI (textos, botones, diálogos, títulos de columnas, aria-labels y notificaciones toast) debe estar en **inglés**.

4. **ensureQuery Deprecado**:

- En nuevas versiones esa api ".ensureQuery" para precargar datos esta deprecada y solo se usa ".query" en su lugar

## ⚙️ Runtime

1. **Bun por defecto**
   - Usar otro package manager esta prohibido en este proyecto. Siempre acude a `bun` o `bunx`

---

## 🦀 Arquitectura y Reglas de Rust (`src-tauri`)

### 1. Separación Estricta: Comandos vs Servicios vs Helpers
- **`commands/` (Controladores IPC delgados)**:
  - Solo reciben la invocación de Tauri (`#[tauri::command]`), extraen argumentos / `State`, delegan la ejecución a un servicio en `services/` y mapean el resultado.
  - **Prohibido**: Escribir lógica de negocio pesada, bucles complejos, algoritmos de archivo o consultas SQL directas dentro de `commands/`.
- **`services/` (Lógica de Dominio y Negocio)**:
  - Toda la lógica reside en módulos funcionales idiomáticos (`services::playlist`, `services::song`, `services::batch`, `services::download`, etc.).
  - Las funciones deben recibir parámetros puros (`&Connection`, rutas, opciones) y retornar `Result<T, ServiceError>`.
- **`helpers/` (Utilidades Puras de Sistema)**:
  - Exclusivamente para funciones auxiliares sin estado ni lógica de negocio acoplada (`fs`, `media`, `paths`, `setup`, `validation`).
  - Si un helper interactúa con la base de datos o coordina un flujo de negocio, **debe ser un servicio**, no un helper.

### 2. Manejo de Errores Tipados (`ServiceError`)
- Usar siempre el enum `ServiceError` (`thiserror`) en la capa de servicios. Evitar strings planos (`Err("mensaje".into())`) dentro de la lógica de dominio.
- La conversión a `String` para el frontend se realiza únicamente en la frontera de `commands/` mediante `.map_err(|err| err.to_string())`.
- Evitar `unwrap()` y `expect()` en rutas de ejecución críticas de producción; propagar errores con el operador `?`.

### 3. Integridad del Contrato con TypeScript
- Al añadir o modificar comandos en `src-tauri/src/commands/`:
  - Los nombres y firmas registrados en `lib.rs` (`tauri::generate_handler![...]`) deben coincidir exactamente con los tipos de `CommandMap` en `src/infrastructure/platform/platform.types.ts`.
