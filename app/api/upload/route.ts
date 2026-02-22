import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const date = formData.get("date") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "No date provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${date}.${ext}`;

    const blob = await put(filename, file, {
      access: "private",
    });

    return NextResponse.json({ path: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
