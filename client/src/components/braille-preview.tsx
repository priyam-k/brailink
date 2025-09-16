import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { convertToBraille } from "@/lib/braille-converter";
import { useToast } from "@/hooks/use-toast";

interface Props {
  text: string;
}

export default function BraillePreview({ text }: Props) {
  const maxLines = 10; // Maximum allowed lines
  const { toast } = useToast();
  const [isTerminating, setIsTerminating] = useState(false);
  const [isTextTooLong, setIsTextTooLong] = useState(false);

  const { formattedText, totalLines } = useMemo(() => convertToBraille(text, 14, maxLines), [text]);

  useMemo(() => {
    if (totalLines > maxLines) {
      setIsTextTooLong(true);
      toast({
        title: "Text Too Long",
        description: `The text exceeds the maximum allowed lines (${maxLines}).`,
        variant: "destructive",
      });
    } else {
      setIsTextTooLong(false);
    }
  }, [totalLines, toast]);

  const handlePrint = async () => {
    if (!text || isTextTooLong) {
      console.log("⚠️ Cannot send to printer due to validation error.");
      return;
    }

    console.log("📤 Sending message to backend:", text);

    try {
      const response = await fetch('http://localhost:3000/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }), // Send the original text
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("✅ Response from backend:", result);
    } catch (error) {
      console.error('❌ Error sending message to backend:', error);
    }
  };

  const handleTerminate = async () => {
    setIsTerminating(true);

    try {
      const response = await fetch('http://localhost:3000/api/terminate-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("✅ Response from backend:", result);
    } catch (error) {
      console.error('❌ Error sending termination signal:', error);
    } finally {
      setIsTerminating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 min-h-[100px] max-h-[300px] font-mono text-xl leading-relaxed overflow-auto whitespace-pre-wrap break-words">
        {formattedText || "Braille preview will appear here"}
      </Card>

      <div className="flex justify-end space-x-2">
        <Button disabled={!text || isTextTooLong} onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Send to Printer
        </Button>
        <Button
          variant="destructive"
          disabled={isTerminating}
          onClick={handleTerminate}
        >
          {isTerminating ? "Stopping..." : "Stop Printing"}
        </Button>
      </div>
    </div>
  );
}