import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Client for Logging
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

  // 1. Implementación de Logging de Diagnóstico
  app.post("/api/config/receive", async (req, res) => {
    const correlationId = req.headers["x-correlation-id"] as string || req.body.correlationId;
    const payload = req.body.payload || req.body;

    console.log(`[Diagnostic] Received payload with Correlation-ID: ${correlationId}`);

    // Log to Supabase if available
    if (supabase) {
      try {
        // Intentar insertar. Si falla porque la tabla no existe, en un entorno real 
        // usaríamos migraciones, pero aquí intentamos el insert directamente.
        const { error } = await supabase.from("payload_logs").insert({
          correlation_id: correlationId || null,
          payload_json: payload,
          received_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error("[Diagnostic] Error logging to Supabase:", error);
          // Nota: Si el error es que la tabla no existe (42P01), el usuario debe crearla.
        }
      } catch (err) {
        console.error("[Diagnostic] Exception logging to Supabase:", err);
      }
    }

    // 2. Transparencia en el Manejo de Errores
    try {
      // Validación técnica detallada
      if (!payload) {
        return res.status(400).json({
          error: "MISSING_PAYLOAD",
          details: "No se recibió ningún payload en el cuerpo de la petición.",
          payload_summary: "null",
          correlation_id: correlationId || "no-id"
        });
      }

      const requiredFields = ["projectId", "config", "sessionToken"];
      const missingFields = requiredFields.filter(field => !payload[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "INVALID_PAYLOAD_FORMAT",
          details: `Faltan los siguientes campos obligatorios: ${missingFields.join(", ")}`,
          payload_summary: JSON.stringify(payload).substring(0, 200),
          correlation_id: correlationId || "no-id"
        });
      }

      if (!payload.config.supabaseUrl || !payload.config.supabaseAnonKey) {
        return res.status(400).json({
          error: "INVALID_CONFIG",
          details: "El objeto 'config' debe contener 'supabaseUrl' y 'supabaseAnonKey'.",
          payload_summary: JSON.stringify(payload.config).substring(0, 200),
          correlation_id: correlationId || "no-id"
        });
      }

      // Si todo está bien, respondemos éxito
      res.json({ 
        status: "ok", 
        message: "Configuración recibida y validada correctamente.",
        correlation_id: correlationId || "no-id"
      });
    } catch (err: any) {
      res.status(500).json({
        error: "INTERNAL_PROCESSING_ERROR",
        details: `Error inesperado durante el procesamiento: ${err.message}`,
        payload_summary: JSON.stringify(payload).substring(0, 200),
        correlation_id: correlationId || "no-id"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
