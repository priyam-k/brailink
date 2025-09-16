import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface Props {
  document: Document | null;
  onUpdate: (doc: Document | null) => void; // Allow null to clear the document
}

export default function TextEditor({ document, onUpdate }: Props) {
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (text: string | null) => { // Allow null to signify clearing
      if (text === null) { // Handle clearing the document
        if (document) { // If a document exists, update it to be empty
          const res = await fetch(`/api/documents/${document.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ editedText: "", sourceText: "" }), // Clear both texts
          });
          if (!res.ok) throw new Error("Failed to clear document text");
          return res.json();
        }
        return null; // No document to clear, or already cleared
      }

      if (!document) {
        // If no document exists, create a new one
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editedText: text, sourceText: text }),
        });
        if (!res.ok) throw new Error('Failed to create document');
        return res.json();
      }

      // Update existing document
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedText: text }),
      });

      if (!res.ok) throw new Error("Failed to update text");
      return res.json();
    },
    onSuccess: (data) => {
      if (data === null && !document?.editedText) { // Successfully cleared an already empty/null doc
        onUpdate(null); // Propagate null to Home to clear currentDoc
         toast({
          title: "Cleared",
          description: "Text box cleared.",
        });
        return;
      }
      if (data === null && document?.editedText) { // Successfully cleared a document that had text
        onUpdate({ ...document, editedText: "", sourceText: "" });
         toast({
          title: "Cleared",
          description: "Text box cleared and saved.",
        });
        return;
      }
      if (data) {
        onUpdate(data);
        toast({
          title: "Saved",
          description: "Text updated successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [localText, setLocalText] = useState(document?.editedText || "");

  const debouncedMutate = useCallback(
    debounce((text: string) => {
      mutate(text);
    }, 1000),
    [mutate] // document.id is implicitly part of mutate's closure if it uses document
  );

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    debouncedMutate(newText);
  }, [debouncedMutate]);

  useEffect(() => {
    setLocalText(document?.editedText || "");
  }, [document?.editedText]);

  const handleClearText = () => {
    setLocalText(""); // Clear local state immediately
    if (document) {
      // If there's a document, update it to be empty
      mutate(null); // Pass null to signify clearing
    } else {
      // If there's no document (it's already null), just ensure onUpdate reflects this
      onUpdate(null);
       toast({
          title: "Cleared",
          description: "Text box cleared.",
        });
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={localText}
        onChange={handleTextChange}
        placeholder="Upload an image, use voice input, or start typing..."
        className="min-h-[200px]"
      />
      <div className="flex justify-end">
        <Button
          variant="destructive" // Changed variant for a "clear" action
          onClick={handleClearText}
          disabled={isPending && localText === ""} // Disable if pending and already cleared
        >
          Clear Text
        </Button>
      </div>
    </div>
  );
}