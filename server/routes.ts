import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai"; // For OCR
import fs from "fs";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";

// Explicitly set the path to the ffmpeg binary
ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg");

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for uploads
  },
});

// GEMINI_API_KEY and genAI are used for the /api/ocr endpoint
const GEMINI_API_KEY = "AIzaSyBfp1Vi-Ujxqn_c2Xonm_pbZUBEW-itpJY"; // Replace with your actual key or use environment variables
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize OpenAI client for audio transcription
const openai = new OpenAI({
  apiKey: "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", // Replace with your actual OpenAI API key
});

export function registerRoutes(app: Express) {
  // OCR Endpoint (using Gemini) - Remains unchanged
  app.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const base64Image = req.file.buffer.toString("base64");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt =
        "Please transcribe any handwritten text in this image. Return only the transcribed text without any additional commentary.";
      console.log("Sending request to Gemini API for OCR with image type:", req.file.mimetype);
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype,
          },
        },
      ]);
      const response = await result.response;
      const transcribedText = response.text();
      console.log("Gemini API OCR Response:", transcribedText);
      const doc = await storage.createDocument({
        sourceText: transcribedText,
        editedText: transcribedText,
      });
      res.json(doc);
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  // Audio Transcription Endpoint (using OpenAI)
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    const uploadsDir = './uploads';
    const tempInputPath = `${uploadsDir}/${req.file.originalname}`; // Original name might be "blob"
    const tempWavPath = `${uploadsDir}/${Date.now()}_output.wav`; // Ensure .wav extension

    try {
      console.log("Received audio file for transcription:", req.file.originalname);

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(tempInputPath, req.file.buffer);
      console.log("Temporary input file saved:", tempInputPath);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .toFormat("wav")
          .on("end", () => {
            console.log("Conversion to .wav completed:", tempWavPath);
            resolve();
          })
          .on("error", (err) => {
            console.error("Error during .wav conversion:", err);
            reject(err);
          })
          .save(tempWavPath);
      });

      // When response_format is "text", the result is the transcribed string directly.
      const transcriptionString: string = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempWavPath),
        model: "whisper-1",
        response_format: "text",
      });

      console.log("Transcription result (string):", transcriptionString);
      res.json({ transcript: transcriptionString }); // Send the string directly

    } catch (error) {
      console.error("Error during transcription process:", error);
      // Ensure to check the type of error for more specific messages if needed
      const errorMessage = error instanceof Error ? error.message : "Failed to transcribe audio";
      let statusCode = 500;
      // @ts-ignore
      if (error.status) { // OpenAI errors often have a status property
        // @ts-ignore
        statusCode = error.status;
      }
      res.status(statusCode).json({ message: "Failed to transcribe audio", error: errorMessage });
    } finally {
      if (fs.existsSync(tempInputPath)) {
        fs.unlinkSync(tempInputPath);
        console.log("Temporary input file deleted:", tempInputPath);
      }
      if (fs.existsSync(tempWavPath)) {
        fs.unlinkSync(tempWavPath);
        console.log("Temporary .wav file deleted:", tempWavPath);
      }
    }
  });

  // Document creation endpoint - Remains unchanged
  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const doc = await storage.createDocument(data);
      res.json(doc);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  // Document update endpoint - Remains unchanged
  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.updateDocument(id, req.body);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      console.error("Failed to update document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}