import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure multer for memory storage
  const upload = multer({ storage: multer.memoryStorage() });

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

  // API Route for Proxy Upload
  app.post("/api/upload-proxy", upload.single("file"), async (req, res) => {
    try {
      // Prioritize server environment variables (secrets) over request body
      const endpoint = process.env.STORAGE_ENDPOINT || process.env.VITE_STORAGE_ENDPOINT || req.body.endpoint;
      const accessKey = process.env.STORAGE_ACCESS_KEY || process.env.VITE_STORAGE_ACCESS_KEY || req.body.accessKey;
      const secretKey = process.env.STORAGE_SECRET_KEY || process.env.VITE_STORAGE_SECRET_KEY || req.body.secretKey;
      const bucket = process.env.STORAGE_BUCKET || process.env.VITE_STORAGE_BUCKET || req.body.bucket;
      const { fileName, contentType } = req.body;
      const file = req.file;

      console.log(`[Proxy] Recibida petición de subida para: ${fileName}`);
      console.log(`[Proxy] Configuración: endpoint=${endpoint}, bucket=${bucket}, hasAccessKey=${!!accessKey}`);

      if (!file || !endpoint || !accessKey || !secretKey || !bucket || !fileName) {
        const missing = [];
        if (!file) missing.push("file");
        if (!endpoint) missing.push("endpoint");
        if (!accessKey) missing.push("accessKey");
        if (!secretKey) missing.push("secretKey");
        if (!bucket) missing.push("bucket");
        if (!fileName) missing.push("fileName");
        
        return res.status(400).json({ 
          error: `Missing required parameters: ${missing.join(", ")}`,
          received: { endpoint, bucket, fileName, hasFile: !!file }
        });
      }

      // DigitalOcean Spaces normalization: ensure we don't have the bucket in the endpoint
      // and that it starts with https://
      let cleanEndpoint = endpoint;
      if (!cleanEndpoint.startsWith('http')) cleanEndpoint = `https://${cleanEndpoint}`;
      
      // If endpoint contains the bucket (e.g. bucket.nyc3.digitaloceanspaces.com), strip it for S3Client
      const urlObj = new URL(cleanEndpoint);
      if (urlObj.hostname.startsWith(`${bucket}.`)) {
        urlObj.hostname = urlObj.hostname.replace(`${bucket}.`, '');
        cleanEndpoint = urlObj.toString();
      }

      const client = new S3Client({
        endpoint: cleanEndpoint,
        region: "us-east-1", // DO Spaces uses us-east-1 for compatibility
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        forcePathStyle: false, // DO Spaces usually uses virtual-host style
      });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: contentType || file.mimetype,
        ACL: "public-read",
      });

      console.log(`[Proxy] Ejecutando PutObjectCommand en bucket: ${bucket}, key: ${fileName}`);
      await client.send(command);

      // Construct public URL
      // If endpoint is https://nyc3.digitaloceanspaces.com, URL is https://bucket.nyc3.digitaloceanspaces.com/key
      const finalUrl = new URL(cleanEndpoint);
      const publicUrl = `https://${bucket}.${finalUrl.hostname}/${fileName}`;

      console.log(`[Proxy] Subida exitosa: ${publicUrl}`);
      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("[Server] Upload proxy failed:", error);
      
      let errorMessage = error.message || "Upload failed";
      if (error.Code === 'NoSuchBucket' || error.name === 'NoSuchBucket') {
        errorMessage = `The specified bucket does not exist in this endpoint. Verified bucket: ${req.body.bucket || process.env.STORAGE_BUCKET}`;
      } else if (error.Code === 'InvalidAccessKeyId' || error.name === 'InvalidAccessKeyId') {
        errorMessage = "Invalid Access Key ID. Check your credentials.";
      } else if (error.Code === 'SignatureDoesNotMatch' || error.name === 'SignatureDoesNotMatch') {
        errorMessage = "Secret Access Key does not match. Check your credentials.";
      }

      res.status(500).json({ error: errorMessage });
    }
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
