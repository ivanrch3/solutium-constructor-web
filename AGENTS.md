# Instrucciones del Agente - Protocolo de Módulos

Usted debe seguir estrictamente el **PROTOCOLO ESTÁNDAR PARA LA CREACIÓN DE MÓDULOS (SOP)** definido en `MODULE_PROTOCOL.md` para cada tarea relacionada con la creación o modificación de módulos en el constructor web.

## Directrices Críticas:
1.  **Jerarquía de Organización:** Siga estrictamente la estructura: `Módulo > Elemento > Grupo (Pilar) > Característica`.
2.  **Los 6 Pilares:** Use exclusivamente los 6 grupos definidos (Contenido, Estructura, Estilo, Tipografía, Multimedia, Interacción) aplicados a cada elemento del módulo.
3.  **Consistencia:** Garantice que la ubicación de las características sea idéntica en todos los módulos.
4.  **Investigación Previa:** Antes de implementar cualquier módulo, realice un benchmarking de 3-5 proveedores líderes.
5.  **Tematización:** Use siempre variables de tema para asegurar que los módulos hereden correctamente los estilos de la aplicación madre.
6.  **Protocolo de Guardado y Publicación Multi-Sitio (SIP v4.0):**
    - **appId:** `11111111-1111-1111-1111-111111111111`.
    - **Contrato `saveData`:** El payload debe incluir `data` (contenido) y `metadata` (`siteId`, `siteName`, `action`, `isPublish`, `timestamp`).
    - **Flujo de Usuario:** Antes de publicar (`action: 'publish'`), es OBLIGATORIO solicitar al usuario un `siteName` (ej: "Página de Inicio").
    - **Diferenciación:** `action: 'save'` para borradores internos y `action: 'publish'` para la versión en vivo accesible vía dominios personalizados.

Consulte `MODULE_PROTOCOL.md` al inicio de cada nueva implementación de módulo.
