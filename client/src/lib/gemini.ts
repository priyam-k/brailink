// Mock Gemini API client - in production would use actual Gemini API
export async function extractTextFromImage(imageData: ArrayBuffer): Promise<string> {
  // Mock implementation - would call Gemini API here
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Sample extracted text from Gemini API");
    }, 1500);
  });
}
