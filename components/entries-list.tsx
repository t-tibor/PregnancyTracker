"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Camera } from "lucide-react";
import { toast } from "sonner";
import { createMeasurement } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Entry {
  date: string;
  weight: number;
  circumference: number | null;
  hasImage: boolean;
}

export function EntriesList({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newWeight, setNewWeight] = useState("60.0");
  const [newCircumference, setNewCircumference] = useState("");
  const [saving, setSaving] = useState(false);

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
      "hu-HU",
      {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  async function handleCreate() {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Kérjük, adjon meg érvényes testsúlyt.");
      return;
    }

    const circumference = newCircumference
      ? parseFloat(newCircumference)
      : null;
    if (circumference !== null && (isNaN(circumference) || circumference <= 0)) {
      toast.error("Kérjük, adjon meg érvényes körfogatértéket.");
      return;
    }

    setSaving(true);
    try {
      await createMeasurement({
        date: newDate,
        weight,
        circumference,
      });
      toast.success("Bejegyzés sikeresen létrehozva!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Sikertelen létrehozás. A dátum már létezhet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Új bejegyzés
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új mérés</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-date">Dátum</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-weight">Testsúly (kg)</Label>
                <Input
                  id="new-weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-circumference">
                  Körfogat (cm){" "}
                  <span className="text-muted-foreground text-xs">
                    nem kötelező
                  </span>
                </Label>
                <Input
                  id="new-circumference"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newCircumference}
                  onChange={(e) => setNewCircumference(e.target.value)}
                  placeholder="—"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Mégse</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Mentés…" : "Mentés"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Még nincsenek bejegyzések. Kattintson az &quot;Új bejegyzés&quot; gombra az első hozzáadásához.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead className="text-right">Testsúly</TableHead>
                <TableHead className="text-right">Körf.</TableHead>
                <TableHead className="text-center">Fotó</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.date}
                  className="cursor-pointer"
                  onClick={() => router.push(`/entries/${entry.date}`)}
                >
                  <TableCell className="font-medium">
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.weight.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {entry.circumference != null
                      ? entry.circumference.toFixed(1)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {entry.hasImage ? (
                      <Camera className="h-4 w-4 mx-auto text-primary" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
