# SIP Hydration Bridge v10.6 — Generic Fallback

## Propósito
Centralizar la compatibilidad entre el contrato de renderización plano (SIP) y la estructura de llaves profundas utilizada por los módulos en el Constructor Web. Asegura que el contenido guardado en la base de datos sea inyectado correctamente en las props de los componentes visuales.

## Módulos con Adaptador Explícito
Estos módulos tienen mapeos específicos para asegurar que llaves complejas (ej. `el_hero_typography_title`) se hidraten desde campos estándar del contrato (ej. `content.title`).

- **Hero**: Incluye soporte para texto dinámico/rotativo (`rotating_fixed`, `rotating_options`, etc).
- **Features**: Hidrata el array de items principal.
- **Pricing**: Hidrata el array de planes.
- **Menu / Header / Navegación**: Hidrata links, logo y layout.
- **About**: Normalizacion de stats (numero/texto/icon), composición Misión/Visión, y mapeo de layout.
- **Process**: Normalización de arrays de pasos (`pasos`, `steps`, `workflow`). Mapeo interno de items (title, desc, icon, badge) y layouts (`horizontal`, `vertical`, `alternating`).
- **Footer**: Hidratación completa de marca, columnas de navegación, redes sociales normalizadas, datos de contacto, newsletter y enlaces legales.
- **Bento**: Adaptador avanzado con auto-layout para evitar solapamientos. Normaliza celdas de diversos tipos (stat, image, cta, text) y mapea global settings (grid columns, gap). Soporta múltiples alias para celdas (`items`, `cards`, `blocks`).
- **Products (Legacy)**: Soporta productos inyectados (`productos`, `items`, `catalogo`). Normalización inteligente de precios (string a number), stock, badges e imágenes. Mapeo de header (title, subtitle, align), layout (columns, gap) y cta text. Auto-set de `selection_mode: manual` si hay datos inyectados.
- **Products Showcase (Catálogo V2)**: Adaptador certificado con soporte para +40 aliases de contenido. Normalización profunda de productos compatible con la interfaz `Product`. Soporta snapshots redundantes en `content` y `settings`. Priorización: Snapshot > Mapeo Explícito > Selección Manual > Catálogo Proyecto.
- **FAQ**: Normalización de preguntas y respuestas. Soporta aliases para header (`title`, `subtitle`, `eyebrow`) y para el array de items (`faq`, `preguntas`, `questions`).
- **Testimonials**: Normalización de testimonios con soporte para autor, cargo, estrellas, avatar y logo de empresa. Soporta layouts de carrusel y rejilla.
- **Stats**: Normalización de indicadores numéricos con soporte para prefijos, sufijos, etiquetas y descripciones. Mapeo de columnas y layouts.
- **Clients**: Mapeo de header (title, subtitle, eyebrow) y layout (columns, gap). Soporta aliases para el array de logos (`clients`, `logos`, `partners`).
- **Team**: Normalización de miembros del equipo (nombre, cargo, bio, avatar, redes sociales). Soporta layouts de rejilla, lista y carrusel.
- **CTA**: Mapeo avanzado de botones primarios y secundarios (label/url). Soporta objetos `cta`, `primary` y `secondary`. Normaliza layouts (centered, split, bento).
- **Newsletter**: Mapeo de header, formulario (placeholder, button text) y mensajes de éxito. Soporta layouts horizontal, lead magnet y barra flotante.
- **Contact**: Normalización profunda de información de contacto, redes sociales y campos de formulario dinámicos. Soporta layouts con mapa y bento.
- **Spacer**: Mapeo de alturas responsivas (desktop/mobile), fondos y divisores. Soporta normalización de espaciado desde valores numéricos o strings.

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
