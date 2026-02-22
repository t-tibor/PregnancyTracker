export const dynamic = 'force-dynamic';

import { getMeasurement } from "@/app/actions";
import { notFound } from "next/navigation";
import { EntryDetail } from "@/components/entry-detail";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const measurement = await getMeasurement(date);

  if (!measurement) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <EntryDetail
        date={date}
        weight={measurement.weight}
        circumference={measurement.circumference}
        imagePath={measurement.imagePath}
      />
    </div>
  );
}
