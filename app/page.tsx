export const dynamic = 'force-dynamic';

import { DailyEntry } from "@/components/daily-entry";
import { getTodayMeasurement, getLatestMeasurement } from "@/app/actions";

export default async function HomePage() {
  const [todayEntry, latestEntry] = await Promise.all([
    getTodayMeasurement(),
    getLatestMeasurement(),
  ]);

  const today = new Date().toISOString().split("T")[0];

  const existing = todayEntry
    ? {
        date: today,
        weight: todayEntry.weight,
        circumference: todayEntry.circumference,
        imagePath: todayEntry.imagePath,
      }
    : null;

  const defaultWeight = latestEntry?.weight ?? 60.0;
  const defaultCircumference = latestEntry?.circumference ?? 70.0;

  return (
    <DailyEntry
      today={today}
      existing={existing}
      defaultWeight={defaultWeight}
      defaultCircumference={defaultCircumference}
    />
  );
}
