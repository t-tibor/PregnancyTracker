import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the display URL for an image path.
 * Private Vercel Blob URLs are routed through the /api/image proxy;
 * local /uploads/ paths are returned as-is.
 */
export function getBlobImageSrc(imagePath: string): string {
  if (imagePath.startsWith("https://") && imagePath.includes("blob.vercel-storage.com")) {
    return `/api/image?url=${encodeURIComponent(imagePath)}`;
  }
  return imagePath;
}
