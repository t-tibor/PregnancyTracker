import { getMeasurements } from "@/app/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TableReportPage() {
  const measurements = await getMeasurements();

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">📋 Table Report</h1>

      {measurements.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No measurements recorded yet. Start by adding your first entry on the
          Home page.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Weight (kg)</TableHead>
                <TableHead className="text-right">Circumference (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((m) => (
                <TableRow key={m.date.toISOString()}>
                  <TableCell className="font-medium">
                    {formatDate(m.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.weight.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {m.circumference != null ? m.circumference.toFixed(1) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {measurements.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {measurements.length} measurement{measurements.length !== 1 ? "s" : ""} recorded
        </p>
      )}
    </div>
  );
}
