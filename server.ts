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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route for Proxy Upload
  app.post("/api/upload-proxy", upload.single("file"), async (req, res) => {
    try {
      const { endpoint, accessKey, secretKey, bucket, fileName, contentType } = req.body;
      const file = req.file;

      if (!file || !endpoint || !accessKey || !secretKey || !bucket || !fileName) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const formattedEndpoint = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;

      const client = new S3Client({
        endpoint: formattedEndpoint,
        region: "us-east-1",
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: contentType || file.mimetype,
        ACL: "public-read",
      });

      await client.send(command);

      const url = new URL(formattedEndpoint);
      const publicUrl = `https://${bucket}.${url.hostname}/${fileName}`;

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("[Server] Upload proxy failed:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
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
