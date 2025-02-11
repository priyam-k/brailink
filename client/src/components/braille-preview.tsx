import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { convertToBraille } from "@/lib/braille-converter";

interface Props {
  text: string;
}

export default function BraillePreview({ text }: Props) {
  const brailleText = useMemo(() => convertToBraille(text), [text]);

  return (
    <div className="space-y-4">
      <Card className="p-6 min-h-[100px] max-h-[300px] font-mono text-xl leading-relaxed overflow-auto whitespace-pre-wrap break-words">
        {brailleText || "Braille preview will appear here"}
      </Card>

      <div className="flex justify-end">
        <Button
          disabled={!text}
          onClick={() => {
            // Mock Arduino print action
            alert("Sending to printer...");
          }}
        >
          <Printer className="mr-2 h-4 w-4" />
          Send to Printer
        </Button>
      </div>
    </div>
  );
}