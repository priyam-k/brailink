import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Import Button component
import { Mic, Square } from "lucide-react"; // Import icons

interface Props {
  onTranscription: (transcribedText: string) => void;
}

export default function VoiceRecorder({ onTranscription }: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm;codecs=opus" }; // Ensure this mimeType is good for your backend
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        const audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType }); // Use the recorder's mimeType
        const formData = new FormData();
        // OpenAI expects a filename with a valid extension.
        // If originalname is just "blob", this helps.
        formData.append("audio", audioBlob, "audio.webm");


        try {
          const response = await fetch("http://localhost:5001/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Transcription API error:", errorData);
            // Optionally, notify the user about the error
            onTranscription(`Error: ${errorData.message || "Transcription failed"}`);
            return;
          }

          const data = await response.json();
          onTranscription(data.transcript || "");
        } catch (error) {
          console.error("Network error or JSON parsing error:", error);
          onTranscription("Error: Could not connect to transcription service.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsedTime(0); // Reset timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      // Handle microphone permission errors, etc.
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    // Note: onTranscription is called in mediaRecorder.onstop
  };

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="text-2xl font-mono">{formatTime(elapsedTime)}</div>
      <div className="flex space-x-4">
        <Button onClick={startRecording} disabled={isRecording} variant="outline">
          <Mic className="mr-2 h-4 w-4" />
          Start Recording
        </Button>
        <Button onClick={stopRecording} disabled={!isRecording} variant="destructive">
          <Square className="mr-2 h-4 w-4" />
          Stop Recording
        </Button>
      </div>
    </div>
  );
}