# Futura integración con Meta Ads

Esta guía documenta el diseño previsto. No implementa OAuth ni consulta estadísticas todavía.

## Flujo de autenticación

- Usar Meta OAuth / Business Login con una Meta App registrada para Solutium.
- Después del consentimiento, permitir seleccionar el Business y la cuenta publicitaria.
- Solicitar únicamente los permisos necesarios para administrar la conexión y leer Insights; los permisos exactos deben confirmarse contra la versión vigente de la Marketing API y pasar App Review cuando aplique.
- Guardar tokens cifrados en el servidor, nunca en el navegador ni en el contenido del sitio.
- Registrar expiración, renovación y revocación; si la renovación falla, marcar la conexión como inactiva y pedir autorización nuevamente.

## APIs y métricas

- Marketing API: conexión con Business, ad accounts y campañas.
- Ads Insights API: gasto, impresiones, alcance, clics, conversiones y costo por resultado.
- La cuenta publicitaria es la fuente de las estadísticas; el Pixel ID por sí solo no permite obtener métricas.
- La futura integración debe manejar paginación, rangos de fecha, zona horaria, límites de uso y errores de permisos.

## Requisitos antes de implementar

1. Meta App y configuración de OAuth/Business Login.
2. Autenticación, selección de Business y selección de ad account.
3. Almacenamiento seguro de tokens, expiración y renovación.
4. Revisión de permisos y App Review si Meta la exige.
5. Servicio backend para consultas de Insights y una política de caché.
