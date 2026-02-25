import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the display URL for an image path.
 * - Local preview URLs (blob:, data:, /) are returned as-is.
 * - Private Vercel Blob URLs are routed through the /api/image proxy.
 */
export function getBlobImageSrc(imagePath: string): string {
  if (
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("/")
  ) {
    return imagePath;
  }
  return `/api/image?url=${encodeURIComponent(imagePath)}`;
}
