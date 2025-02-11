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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        const error = await res.json();
        throw new Error(error.message || "Failed to process image");
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
    onError: (error: Error) => {
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
        setPreviewUrl(URL.createObjectURL(file));
        mutate(file);
      }
    },
    [mutate],
  );

  const handleFileSelect = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    mutate(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed rounded-lg p-6 text-center"
    >
      {previewUrl ? (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 mx-auto object-contain rounded-lg"
          />
        </div>
      ) : (
        <div className="mb-4">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop an image with handwritten text, or click to select
      </p>

      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <Button
        disabled={isPending}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        {isPending ? "Processing..." : "Select Image"}
      </Button>

      {isPending && (
        <Progress value={undefined} className="mt-4" />
      )}
    </div>
  );
}