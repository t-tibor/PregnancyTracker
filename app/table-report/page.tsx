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
    return new Date(date).toLocaleDateString("hu-HU", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">📋 Táblázatos Kimutatás</h1>

      {measurements.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Még nincs rögzített mérés. Kezdd az első bejegyzés hozzáadásával a Főoldalon.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead className="text-right">Testsúly (kg)</TableHead>
                <TableHead className="text-right">Körfogat (cm)</TableHead>
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
          {measurements.length} mérés rögzítve
        </p>
      )}
    </div>
  );
}
