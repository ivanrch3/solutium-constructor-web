# Solutium Constructor Web - Desarrollo Local (DevEnv-2)

Esta guía explica cómo configurar y ejecutar el Constructor Web localmente para que funcione en conjunto con la **App Madre** local.

## Puertos Oficiales
- **App Madre (Frontend + API):** `http://localhost:3000`
- **Constructor Web:** `http://localhost:3010` (En AI Studio corre en 3000)

## Requisitos Previos
1. Tener la **App Madre** corriendo localmente en el puerto 3000.
2. Node.js v18+ instalado.

## Configuración del Entorno
1. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.local.example .env.local
   ```
2. Asegúrate de que `VITE_LOCAL_PORT=3010` esté configurado en tu `.env.local` para uso fuera de AI Studio.

## Instalación y Ejecución
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo (correrá en http://localhost:3010):
   ```bash
   npm run dev
   ```

## Integración con App Madre (S.I.P.)
El Constructor Web está diseñado para recibir su contexto mediante el protocolo **S.I.P. (Solutium Integration Protocol)** a través de `postMessage` desde la App Madre.

Al abrir el Constructor desde `localhost:3000`, la App Madre cargará el iframe apuntando a `http://localhost:3010`.

### Variables de Origen Admitidas
Para el handshake local, se permiten los siguientes orígenes:
- `http://localhost:3000`
- `http://localhost:3010`

## Funcionalidades de IA (Piloto)
Si `VITE_ENV=local`, el Constructor intentará realizar peticiones de generación IA al backend local de la App Madre en:
`POST http://localhost:3000/api/web-builder/ai/generate-section`

## Protocolo de Validación (QA)
1. **Contexto S.I.P.:** Verificar en consola `[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]` con el `projectId`.
2. **API Base:** Verificar que las llamadas a `/api/web-builder` utilicen `localhost:3000`.
3. **IA Generativa:** Usar el botón "IA" en el módulo Bento. Debe registrarse el `idempotencyKey` y el consumo de 2 créditos.
4. **Idempotencia:** Repetir la solicitud con la misma key; el balance no debe cambiar.

## Notas de Seguridad
- No se han realizado cambios en el esquema de Supabase.
- S.I.P. mantiene su integridad y solo se han añadido excepciones para `localhost` en desarrollo.
- El cobro de créditos de IA se gestiona centralizadamente en la App Madre.
