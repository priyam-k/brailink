import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface Props {
  document: Document | null;
  onUpdate: (doc: Document) => void;
}

export default function TextEditor({ document, onUpdate }: Props) {
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (text: string) => {
      if (!document) throw new Error("No document loaded");

      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedText: text }),
      });

      if (!res.ok) throw new Error("Failed to update text");
      return res.json();
    },
    onSuccess: (data) => {
      onUpdate(data);
      toast({
        title: "Saved",
        description: "Text updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <Textarea
        value={document?.editedText || ""}
        onChange={(e) => mutate(e.target.value)}
        placeholder="Upload an image or start typing..."
        className="min-h-[200px]"
        disabled={isPending}
      />
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={!document || isPending}
          onClick={() => {
            if (document) {
              mutate(document.sourceText);
            }
          }}
        >
          Reset to Original
        </Button>
      </div>
    </div>
  );
}
