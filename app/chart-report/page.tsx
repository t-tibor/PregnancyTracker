import { getMeasurements } from "@/app/actions";
import { ChartReport } from "@/components/charts/chart-report";

export default async function ChartReportPage() {
  const measurements = await getMeasurements();

  // Reverse to chronological order (oldest first) for charts
  const chronological = [...measurements].reverse();

  const chartData = chronological.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fullDate: new Date(m.date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    weight: m.weight,
    circumference: m.circumference,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">📊 Chart Report</h1>

      {chartData.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No measurements recorded yet. Start by adding your first entry on the
          Home page.
        </p>
      ) : (
        <ChartReport data={chartData} />
      )}
    </div>
  );
}
