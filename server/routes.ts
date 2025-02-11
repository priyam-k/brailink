import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export function registerRoutes(app: Express) {
  app.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Mock Gemini API call - in production this would call the actual API
      const mockOcrText = "Sample OCR text from image";
      
      const doc = await storage.createDocument({
        sourceText: mockOcrText,
        editedText: mockOcrText,
      });

      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const doc = await storage.createDocument(data);
      res.json(doc);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.updateDocument(id, req.body);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
