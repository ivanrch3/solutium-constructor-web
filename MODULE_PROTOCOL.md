# PROTOCOLO ESTÁNDAR PARA LA CREACIÓN DE MÓDULOS (SOP)

Este documento es la referencia inamovible para la creación de todos los módulos en el constructor web. Su objetivo es garantizar la uniformidad, consistencia y una experiencia de usuario predecible.

## 1. FASES DEL DESARROLLO

### Fase 0: Inteligencia y Benchmarking
*   **Investigación:** Analizar 3-5 proveedores líderes del sector para el tipo de módulo específico.
*   **Extracción:** Identificar características esenciales y diferenciales ("wow factors") que ofrecen soluciones de primer nivel.

### Fase 1: Organización Estándar (Jerarquía y los 6 Pilares)
Para cada módulo, primero se identifican los **Elementos** que lo componen (ej: Título, Imagen, Botón, Configuración Global). Para cada uno de estos elementos, las características detectadas se organizan **exclusivamente** en estos 6 grupos (mostrando solo los que apliquen según la naturaleza del elemento):

1.  **Contenido:** Textos, etiquetas, valores y fuentes de datos.
2.  **Estructura:** Layout, grillas, alineaciones, márgenes y rellenos (padding).
3.  **Estilo:** Colores, bordes, sombras, radios y efectos visuales de fondo.
4.  **Tipografía:** Tamaños de fuente, pesos, interlineado y transformaciones de texto.
5.  **Multimedia:** Gestión de imágenes, iconos, videos y sus propiedades de ajuste.
6.  **Interacción:** Comportamiento de botones, enlaces, efectos hover y disparadores de eventos.

**Jerarquía Visual en el Editor:**
`Módulo > Elemento > Grupo (Pilar) > Característica`

### Fase 2: Arquitectura de Datos (Referencia: Módulo Productos)
*   Definición del objeto constante del módulo con ID único.
*   Creación del esquema de `Settings` siguiendo estrictamente la jerarquía de los 6 grupos.
*   Establecimiento de valores por defecto coherentes con la investigación de la Fase 0.

### Fase 3: Implementación del Componente (Referencia: Módulo Productos)
*   Creación del componente React en `src/components/constructor/modules/`.
*   Lógica de extracción de valores desde `settingsValues` con prioridad sobre valores por defecto.
*   Maquetación 100% tematizada con variables CSS y Tailwind, garantizando responsividad y contraste.

### Fase 4: Integración en el Editor (Referencia: Módulo Productos)
*   Registro en el panel lateral de categorías del constructor.
*   Mapeo jerárquico en el `StructurePanel`.
*   Vinculación de cada ajuste con `SettingControl` para edición en tiempo real sin fricciones.

---

## 2. REGLAS DE ORO PARA LA UNIFORMIDAD

1.  **Ubicación Predecible:** Una característica (ej: tamaño de fuente) **SIEMPRE** debe estar en el mismo grupo (Tipografía) en todos los módulos.
2.  **Visibilidad Condicional:** Solo se muestran los grupos que apliquen al elemento seleccionado.
3.  **Tematización:** Nunca usar colores hardcoded; usar siempre las variables del tema (`--primary-color`, `--sidebar-bg`, etc.).
4.  **Nomenclatura:** Usar nombres claros y consistentes para los IDs de los ajustes (ej: `titleText`, `titleFontSize`, `titleColor`).

---

## 3. CONTRATO DE DATOS E HIDRATACIÓN (SIP v10.5)

Para garantizar la compatibilidad entre el editor (Draft), el renderizado público (Published) y los bridges de compatibilidad, se deben seguir estas reglas:

1.  **Fuentes de Verdad:**
    *   **Editor:** La fuente primaria es `content_draft` y el estado del canvas usa `editorState.settingsValues` (llaves profundas).
    *   **Publicado:** `content_published` utiliza una estructura híbrida de `section.content` (datos planos/SEO) + `section.settings` (ajustes globales/estilo).
2.  **Hydration Bridge:** El componente `Viewer` debe utilizar `src/utils/hydrationBridge.ts` para mapear dinámicamente datos desde `section.content` hacia las llaves profundas esperadas por los módulos renderizadores.
3.  **Prioridad de Valores:**
    *   Si ya existe una llave profunda (`deep key`) en `settingsValues`, esta tiene prioridad absoluta.
    *   El bridge solo debe hidratar si la llave está `undefined`.
    *   **NUNCA** usar `if(value)` para decidir si se hidrata; usar `const hasValue = value !== undefined && value !== null;`. Valores como `false`, `0` y `""` son válidos e intencionales.
4.  **Repeaters:** Los repeaters (listas de elementos) deben conservar la llave real definida en el `registry.tsx` (ej: `el_module_items_plans`) para evitar pérdida de datos durante la persistencia.
5.  **Layout y Responsividad:**
    *   Los módulos que dependan del ancho del contenedor (ej: Pricing, Features) deben usar **Container Queries** (`@container`) en su nodo raíz.
    *   Evitar el uso de `window.innerWidth` para cálculos de layout en el renderizador.
6.  **Validación de Campos:** No usar operadores `includes` ambiguos en la lógica de renderizado para detectar tipos de campo. Las validaciones deben ser explícitas por ID de ajuste o tipo definido.
7.  **Preservación de Llaves:** Los bridges de compatibilidad en `hydrationBridge.ts` deben registrarse por tipo de módulo y mapear solo lo estrictamente necesario para no ensuciar el objeto de settings resultante.
