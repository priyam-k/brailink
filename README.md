# BraiLink - Braille Printer System

A comprehensive web application that converts text to Braille and sends it to a physical Braille printer via Raspberry Pi. The system includes OCR capabilities for handwritten text recognition, voice transcription, and real-time Braille preview.

## Features

- **Text to Braille Conversion**: Real-time conversion with preview
- **OCR (Optical Character Recognition)**: Upload images to extract handwritten text
- **Voice Transcription**: Record audio and convert speech to text
- **Braille Preview**: Live preview of how text will appear in Braille
- **Physical Printing**: Send Braille output to a physical printer via Raspberry Pi
- **Line Limit Validation**: Prevents printing if text exceeds maximum line limits
- **Responsive Design**: Modern UI built with React and TypeScript

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Web APIs**: MediaRecorder, getUserMedia for voice recording
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** with better-sqlite3 for data storage
- **Multer** for file uploads
- **FFmpeg** for audio processing

### AI/ML Services
- **Google Gemini AI** for OCR processing
- **OpenAI Whisper** for audio transcription

### Hardware Integration
- **Raspberry Pi** for Braille printer control
- **SSH** communication between backend and Raspberry Pi
