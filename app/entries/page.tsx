import { getMeasurements } from "@/app/actions";
import { EntriesList } from "@/components/entries-list";

export default async function EntriesPage() {
  const measurements = await getMeasurements();

  const entries = measurements.map((m) => ({
    date: new Date(m.date).toISOString().split("T")[0],
    weight: m.weight,
    circumference: m.circumference,
    hasImage: !!m.imagePath,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">⚙️ Admin — Entries</h1>
      <EntriesList entries={entries} />
    </div>
  );
}
