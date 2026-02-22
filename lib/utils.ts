import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the display URL for a private Vercel Blob image path,
 * routed through the /api/image proxy.
 */
export function getBlobImageSrc(imagePath: string): string {
  return `/api/image?url=${encodeURIComponent(imagePath)}`;
}
