import express from "express";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { AIBrokerService } from "./src/services/aiBrokerService";
import { initSupabase } from "./src/services/supabaseClient";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || process.env.VITE_LOCAL_PORT || 3010);

  // Initialize Supabase for backend use if keys are available in env
  const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (sbUrl && sbKey) {
    initSupabase(sbUrl, sbKey, '');
    console.log('[Supabase] Initialized in backend server');
  } else {
    console.warn('[Supabase] Backend initialization skipped: Missing keys');
  }

  app.use(express.json());
  
  // Debug logger
  app.use((req, res, next) => {
    console.log(`[REAL_BACKEND_DEBUG] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Generation Bridge (Real Endpoint)
  app.post("/api/web-builder/ai/generate-section", async (req, res) => {
    const { projectId, userId = 'dev-user', appSlug, actionSlug, prompt, idempotencyKey } = req.body;
    
    // Auth Check Simulation
    const authHeader = req.headers.authorization;
    console.log('[WEB_BUILDER_AI_AUTH_DEBUG]', {
      hasAuthorizationHeader: !!authHeader,
      authType: authHeader?.split(' ')[0] || 'none',
      projectId,
      actionSlug,
      idempotencyKey,
      tokenPreview: authHeader ? `${authHeader.substring(0, 15)}...` : 'none'
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[AI_BRIDGE] 401 Unauthorized: No token provided');
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Normalizar uso de Gemini Key (Solo backend)
    console.log('[AI_BRIDGE] ENV - GEMINI_API_KEY length:', (process.env.GEMINI_API_KEY || '').length);
    console.log('[AI_BRIDGE] ENV - VITE_GEMINI_API_KEY length:', (process.env.VITE_GEMINI_API_KEY || '').length);
    
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!geminiKey || geminiKey.length < 15) {
      console.error("[AI_BRIDGE] Missing or invalid GEMINI_API_KEY in environment");
      return res.status(500).json({ error: "Valid GEMINI_API_KEY not found in server environment" });
    }
    
    console.log(`[AI_BRIDGE] Using backend GEMINI_API_KEY starting with ${geminiKey.substring(0, 5)}...`);

    try {
      const result = await AIBrokerService.processAIRequest({
        projectId,
        userId,
        appSlug,
        actionSlug,
        prompt,
        idempotencyKey,
        geminiApiKey: geminiKey
      });

      res.json(result);
    } catch (error: any) {
      console.error("[WEB_BUILDER_AI_ERROR]", error);
      res.status(500).json({ error: error.message || "Internal AI Broker Error" });
    }
  });

  // Deprecated local media proxy.
  // Stock media search must be resolved by App Madre through /api/media/pexels/search.
  app.get("/api/images/search", async (req, res) => {
    res.status(410).json({
      error: "Deprecated endpoint",
      message: "Use App Madre /api/media/pexels/search instead of the local constructor proxy."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
    app.use(vite.middlewares);

    // Serve index.html with Vite transformations
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200)
           .set({ 
             "Content-Type": "text/html",
             "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
             "Pragma": "no-cache",
             "Expires": "0"
           })
           .end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get("*", (req, res) => {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
