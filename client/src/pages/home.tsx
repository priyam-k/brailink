import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OcrUploader from "@/components/ocr-uploader";
import TextEditor from "@/components/text-editor";
import BraillePreview from "@/components/braille-preview";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useState } from "react";
import type { Document } from "@shared/schema";
import React from "react";

export default function Home() {
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);

  const handleTranscription = (transcribedText: string) => {
    console.log("Received transcription in Home:", transcribedText);
    setCurrentDoc((prevDoc) => {
      const newText = (prevDoc?.editedText ? prevDoc.editedText + " " : "") + transcribedText;
      return prevDoc
        ? { ...prevDoc, editedText: newText }
        : {
            id: Date.now(), // Generate a unique ID
            sourceText: "", // Or set to transcribedText if it's the primary source
            editedText: transcribedText,
            status: "new",
            isProcessed: false,
          };
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            The Braille Printer
          </h1>
          <p className="text-muted-foreground mt-2">
            Convert handwritten text and audio input to Braille with ease
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <OcrUploader onSuccess={setCurrentDoc} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Edit Text</CardTitle>
            </CardHeader>
            <CardContent>
              <TextEditor document={currentDoc} onUpdate={setCurrentDoc} />
            </CardContent>
          </Card>
        </div>

        {/* Voice Recorder Section Moved Up */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Recorder</CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder onTranscription={handleTranscription} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Braille Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <BraillePreview text={currentDoc?.editedText || ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}