"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

function todayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Deletes a Vercel Blob image if the path is a blob URL. Silently ignores local paths. */
export async function deleteBlobImage(imagePath: string | null) {
  if (imagePath?.includes("blob.vercel-storage.com")) {
    try {
      await del(imagePath);
    } catch {
      // Non-fatal: log but don't block the main operation
      console.warn("Failed to delete blob:", imagePath);
    }
  }
}

export async function getTodayMeasurement() {
  return prisma.measurement.findUnique({
    where: { date: todayDate() },
  });
}

export async function getLatestMeasurement() {
  return prisma.measurement.findFirst({
    orderBy: { date: "desc" },
  });
}

export async function getMeasurements() {
  return prisma.measurement.findMany({
    orderBy: { date: "desc" },
  });
}

export async function getMeasurement(dateStr: string) {
  return prisma.measurement.findUnique({
    where: { date: parseDate(dateStr) },
  });
}

export async function createMeasurement(data: {
  date: string;
  weight: number;
  circumference?: number | null;
  imagePath?: string | null;
}) {
  const measurement = await prisma.measurement.create({
    data: {
      date: parseDate(data.date),
      weight: data.weight,
      circumference: data.circumference ?? null,
      imagePath: data.imagePath ?? null,
    },
  });
  revalidatePath("/");
  revalidatePath("/entries");
  revalidatePath("/table-report");
  revalidatePath("/chart-report");
  return measurement;
}

export async function updateMeasurement(
  dateStr: string,
  data: {
    weight: number;
    circumference?: number | null;
    imagePath?: string | null;
  }
) {
  const measurement = await prisma.measurement.update({
    where: { date: parseDate(dateStr) },
    data: {
      weight: data.weight,
      circumference: data.circumference ?? null,
      imagePath: data.imagePath ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/entries");
  revalidatePath(`/entries/${dateStr}`);
  revalidatePath("/table-report");
  revalidatePath("/chart-report");
  return measurement;
}

export async function deleteImage(dateStr: string) {
  const existing = await prisma.measurement.findUnique({
    where: { date: parseDate(dateStr) },
    select: { imagePath: true },
  });

  await deleteBlobImage(existing?.imagePath ?? null);

  await prisma.measurement.update({
    where: { date: parseDate(dateStr) },
    data: { imagePath: null },
  });

  revalidatePath("/");
  revalidatePath("/entries");
  revalidatePath(`/entries/${dateStr}`);
  revalidatePath("/table-report");
  revalidatePath("/chart-report");
}

export async function deleteMeasurement(dateStr: string) {
  // Fetch imagePath before deleting so we can clean up the blob
  const existing = await prisma.measurement.findUnique({
    where: { date: parseDate(dateStr) },
    select: { imagePath: true },
  });

  await prisma.measurement.delete({
    where: { date: parseDate(dateStr) },
  });

  await deleteBlobImage(existing?.imagePath ?? null);

  revalidatePath("/");
  revalidatePath("/entries");
  revalidatePath("/table-report");
  revalidatePath("/chart-report");
}
