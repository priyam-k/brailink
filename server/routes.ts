import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function registerRoutes(app: Express) {
  app.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert image buffer to base64
      const base64Image = req.file.buffer.toString('base64');

      // Initialize Gemini Vision model with the new flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "Please transcribe any handwritten text in this image. Return only the transcribed text without any additional commentary.";

      console.log('Sending request to Gemini API with image type:', req.file.mimetype);

      // Generate content from image using the correct format
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype
          }
        }
      ]);

      const response = await result.response;
      const transcribedText = response.text();

      console.log('Gemini API Response:', transcribedText);

      const doc = await storage.createDocument({
        sourceText: transcribedText,
        editedText: transcribedText,
      });

      res.json(doc);
    } catch (error) {
      console.error('OCR Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      res.status(500).json({ message: errorMessage });
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