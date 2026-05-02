import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Debug logger for all requests
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Pexels Proxy
  app.get("/api/images/search", async (req, res) => {
    try {
      const { query, per_page = "15", page = "1" } = req.query;
      const apiKey = process.env.VITE_PEXELS_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Pexels API Key not configured on server" });
      }

      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query as string)}&per_page=${per_page}&page=${page}`;
      
      const response = await fetch(pexelsUrl, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("[Server] Pexels proxy failed:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
