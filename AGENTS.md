# Instrucciones del Agente - Protocolo de Módulos

Usted debe seguir estrictamente el **PROTOCOLO ESTÁNDAR PARA LA CREACIÓN DE MÓDULOS (SOP)** definido en `MODULE_PROTOCOL.md` para cada tarea relacionada con la creación o modificación de módulos en el constructor web.

## Directrices Críticas:
1.  **Jerarquía de Organización:** Siga estrictamente la estructura: `Módulo > Elemento > Grupo (Pilar) > Característica`.
2.  **Los 6 Pilares:** Use exclusivamente los 6 grupos definidos (Contenido, Estructura, Estilo, Tipografía, Multimedia, Interacción) aplicados a cada elemento del módulo.
3.  **Consistencia:** Garantice que la ubicación de las características sea idéntica en todos los módulos.
4.  **Investigación Previa:** Antes de implementar cualquier módulo, realice un benchmarking de 3-5 proveedores líderes.
5.  **Tematización:** Use siempre variables de tema para asegurar que los módulos hereden correctamente los estilos de la aplicación madre.
6.  ## Protocolo de Comunicación SIP v4.0 (Guardado y Publicación Multi-Sitio):
- **appId:** `11111111-1111-1111-1111-111111111111`.
- **Identificación de Páginas:** Cada página DEBE tener un `siteId` (UUID) y un `siteName` (Nombre amigable). Estos campos deben enviarse en el objeto `metadata`.
- **Acciones de Persistencia:**
    - **GUARDAR BORRADOR:** Usa la acción `saveDraft`. Esto guarda el contenido en `web_builder_sites` con `is_active = FALSE`.
    - **PUBLICAR:** Usa la acción `publishSite`. Esto copia el contenido a `published_sites` con `is_active = TRUE`. Solo estos son visibles en dominios personalizados.
- **Estructura del Contenido (content):** El objeto `content` debe seguir el contrato: `{ "theme": { ... }, "sections": [ ... ] }`.
- **Gestión de Activos:** Al subir archivos, el campo `origin_app` debe ser obligatoriamente `'solutium constructor web'`.
- **Flujo de Usuario:** Antes de publicar por primera vez, solicita al usuario un `siteName`. Informa que la página podrá ser vinculada a un dominio desde el panel de "Dominios" en la App Madre.

Consulte `MODULE_PROTOCOL.md` al inicio de cada nueva implementación de módulo.
