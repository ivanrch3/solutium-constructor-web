# SIP Hydration Bridge v10.6 — Generic Fallback

## Propósito
Centralizar la compatibilidad entre el contrato de renderización plano (SIP) y la estructura de llaves profundas utilizada por los módulos en el Constructor Web. Asegura que el contenido guardado en la base de datos sea inyectado correctamente en las props de los componentes visuales.

## Módulos con Adaptador Explícito
Estos módulos tienen mapeos específicos para asegurar que llaves complejas (ej. `el_hero_typography_title`) se hidraten desde campos estándar del contrato (ej. `content.title`).

- **Hero**: Incluye soporte para texto dinámico/rotativo (`rotating_fixed`, `rotating_options`, etc).
- **Features**: Hidrata el array de items principal.
- **Pricing**: Hidrata el array de planes.
- **Menu / Header / Navegación**: Hidrata links, logo y layout.

## Fallback Genérico (Novedad v10.6)
Para todos los demás módulos, se aplica una estrategia de "Auto-Prefijado" no destructiva:
1. Toma cada llave en `content` (ej. `title`).
2. Genera una llave equivalente prefijada con el ID del módulo (ej. `mod_123_title`).
3. **Regla de Oro**: Solo se añade la llave si `result[fullKey] === undefined`. Nunca sobrescribe valores reales del editor de propiedades.

## Limitaciones Conocidas
- **Estructuras Anidadas**: El fallback genérico es plano. Si un módulo requiere llaves anidadas muy profundas dentro de arrays que no siguen el patrón `moduleId_fieldName`, requerirá adaptador explícito.
- **Candidatos Futuros**: `footer`, `bento`, `comparative` y `gallery` podrían requerir adaptadores si sus estructuras internas se vuelven más complejas.

## Depuración
Se han incluido logs bajo el tag `[HYDRATION_BRIDGE_DEBUG]`.
Solo se activan si `?debug_render=true` está presente en la URL o si el modo debug está habilitado globalmente.
