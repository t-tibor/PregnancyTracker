import { describe, it, expect } from "vitest";
import { cn, getBlobImageSrc } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "flex")).toBe("base flex");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

describe("getBlobImageSrc", () => {
  it("returns local paths as-is", () => {
    expect(getBlobImageSrc("/uploads/photo.jpg")).toBe("/uploads/photo.jpg");
  });

  it("returns blob URLs as-is", () => {
    expect(getBlobImageSrc("blob:http://localhost/abc")).toBe(
      "blob:http://localhost/abc"
    );
  });

  it("returns data URLs as-is", () => {
    expect(getBlobImageSrc("data:image/png;base64,abc")).toBe(
      "data:image/png;base64,abc"
    );
  });

  it("proxies external URLs through /api/image", () => {
    const url = "https://blob.vercel-storage.com/photo.jpg";
    expect(getBlobImageSrc(url)).toBe(
      `/api/image?url=${encodeURIComponent(url)}`
    );
  });
});
