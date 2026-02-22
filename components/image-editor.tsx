"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  imagePath: string | null;
  readonly?: boolean;
  onImageSelected: (file: File) => void;
}

export function ImageEditor({
  imagePath,
  readonly = false,
  onImageSelected,
}: ImageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!readonly && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={handleClick}
        className={cn(
          "relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          readonly
            ? "border-muted cursor-default"
            : "border-primary/30 cursor-pointer hover:border-primary/60 hover:bg-primary/5"
        )}
      >
        {imagePath ? (
          <Image
            src={imagePath}
            alt="Belly photo"
            fill
            className="object-cover"
            sizes="256px"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="h-12 w-12" />
            <span className="text-sm">
              {readonly ? "No photo" : "Tap to add photo"}
            </span>
          </div>
        )}

        {!readonly && imagePath && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
            <Camera className="h-8 w-8 text-white" />
            <span className="ml-2 text-sm text-white">Change photo</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
