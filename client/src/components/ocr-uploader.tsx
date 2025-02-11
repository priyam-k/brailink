import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface Props {
  onSuccess: (doc: Document) => void;
}

export default function OcrUploader({ onSuccess }: Props) {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process image");
      }

      return res.json();
    },
    onSuccess: (data) => {
      onSuccess(data);
      toast({
        title: "Success",
        description: "Image processed successfully",
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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        mutate(file);
      }
    },
    [mutate],
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-lg p-6 text-center"
    >
      <div className="mb-4">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop an image, or click to select
      </p>

      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mutate(file);
        }}
      />

      <Button
        disabled={isPending}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Select Image
      </Button>

      {isPending && (
        <Progress value={progress} className="mt-4" />
      )}
    </div>
  );
}
