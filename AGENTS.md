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

## 📐 Reglas Generales de Arquitectura y Diseño

1. **Rutas de Importación**:
   - Usar estrictamente alias `@/*` para todas las importaciones internas dentro de `src/`.
   - Prohibido el uso de importaciones relativas a directorios superiores (`../`).

2. **Radios de Borde**:
   - Prohibido el uso de `rounded-full` en cualquier parte de `src/`.
   - Utilizar la escala de bordes definida por el tema (`rounded-sm`, `rounded-md`, `rounded-lg`).

3. **Idioma de la Interfaz**:
   - Todo el contenido de cara al usuario en la UI (textos, botones, diálogos, títulos de columnas, aria-labels y notificaciones toast) debe estar en **inglés**.
