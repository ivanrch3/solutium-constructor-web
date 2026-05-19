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

---

## 4. ESTADO OFICIAL DE MODULOS

### Modulos oficiales

#### `products`
*   Es el modulo oficial para productos/catalogo.
*   Reemplaza funcionalmente a `products_showcase`.
*   Debe mantenerse como la implementacion soportada para nuevas paginas.

#### `trusted_logos`
*   Es el modulo oficial para logos de empresas/clientes.
*   Reemplaza funcionalmente a `clients`.
*   Debe mantenerse como la implementacion soportada para nuevas paginas.

### Modulos legacy ocultos

#### `clients`
*   Estado: `deprecated: true`
*   Biblioteca: `hiddenFromLibrary: true`
*   Reemplazo oficial: `trusted_logos`
*   No debe aparecer como opcion agregable para nuevos usuarios.
*   No debe eliminarse porque puede existir en paginas antiguas.

#### `products_showcase`
*   Estado: experimental/legacy oculto.
*   Biblioteca: `hiddenFromLibrary: true`
*   Reemplazo oficial: `products`
*   No debe aparecer como opcion agregable para nuevos usuarios.
*   No debe eliminarse porque puede existir en paginas antiguas.

---

## 5. CONTRATO OFICIAL DE `trusted_logos`

### DTO

```ts
type TrustedCompanyLogo = {
  company_id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  alt?: string;
};
```

### Fuente en editor
*   Origen: `customers` filtrados por `project_id`.
*   Campos base:
    *   `company`
    *   `company_logo_url`
    *   `business_id`
    *   `updated_at`

### Reglas de normalizacion
*   Excluir clientes sin `company`.
*   Excluir clientes sin `companyLogoUrl`.
*   Deduplicar por `businessId` si existe.
*   Fallback por nombre normalizado.
*   Fallback final por `id`.
*   El viewer publicado no consulta CRM/Supabase en vivo.
*   El viewer publicado renderiza exclusivamente desde snapshot.

### Snapshot publicado
*   `content.companies`
*   `content.logos`
*   `settings[${moduleId}_el_trusted_logos_items_companies]`
*   `settings[${moduleId}_el_trusted_logos_data_select_companies]`

### Orden de lectura en Viewer
1.  `content.companies`
2.  `content.logos`
3.  `settings[${moduleId}_el_trusted_logos_items_companies]`
4.  `[]`

---

## 6. CONTRATO OFICIAL DE `products`

*   `products` es el modulo soportado para catalogo/productos.
*   El contrato publicado debe priorizar snapshot persistido sobre catalogo vivo.
*   Las llaves de snapshot robustas de referencia son:
    *   `content.products`
    *   `content.productos`
    *   `content.items`
    *   `settings[${moduleId}_el_products_items_products]`
*   No refactorizar `ProductsModule` salvo bug concreto o decision arquitectonica explicita.

---

## 7. REGLAS DE COMPATIBILIDAD Y NO REGRESION

*   No eliminar `ClientsModule.tsx`.
*   No eliminar `ProductsShowcaseModule.tsx`.
*   No eliminar cases legacy en `Canvas.tsx`.
*   No eliminar cases legacy en `Viewer.tsx`.
*   No eliminar soporte legacy en `hydrationBridge.ts`.
*   No reutilizar keys de `clients` para `trusted_logos`.
*   No reactivar `products_showcase` sin decision explicita.
*   No refactorizar `ProductsModule` salvo bug concreto.
*   Si un modulo legacy esta oculto para nuevos usuarios, eso no autoriza a remover su soporte de render o hidratacion.

---

## 8. NOTA OPERATIVA SOBRE `App.tsx` Y FUSION DRAFT/PUBLISHED

*   Existe un fix operativo en `src/App.tsx` para la fusion de registros `draft` y `published` por `siteId`.
*   Problema corregido: un draft podia pisar el `content` publicado al fusionar ambas fuentes en memoria.
*   Impacto del bug: podia romper el render published general aunque el contrato publicado estuviera correcto.
*   Regla de no regresion: al fusionar draft y published, preservar siempre el `content` valido del published cuando sea la fuente activa de render.
*   Cualquier cambio futuro en `refreshData`, merge por `siteId` o resolucion de `status` debe validarse contra Draft, Published y Viewer local antes de considerarse seguro.

---

## 9. COMPATIBILIDAD HEADER / `conversion`

*   El modulo visual "Barra Superior" usa `HeaderModule`.
*   En datos legacy/publicados puede aparecer como `type: 'conversion'`.
*   El `Viewer` debe soportar ambos tipos:
    *   `header`
    *   `conversion`
*   `conversion` no debe eliminarse del `Viewer` sin una migracion explicita de datos publicados.
*   No migrar datos antiguos solo para este caso sin una estrategia formal.
*   Si en el futuro se normaliza el tipo oficial, preferir `header` como nombre semantico, manteniendo `conversion` como alias de compatibilidad.
