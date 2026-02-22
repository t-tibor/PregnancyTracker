import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint for serving private Vercel Blob images.
 * The browser can't load private blob URLs directly — this route fetches
 * them server-side using the BLOB_READ_WRITE_TOKEN and streams them back.
 *
 * Usage: /api/image?url=<encoded-blob-url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob not configured" }, { status: 500 });
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      // Blob URLs are content-addressed so they can be cached indefinitely
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
