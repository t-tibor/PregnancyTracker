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
      "en-US",
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
      toast.error("Please enter a valid weight.");
      return;
    }

    const circumference = newCircumference
      ? parseFloat(newCircumference)
      : null;
    if (circumference !== null && (isNaN(circumference) || circumference <= 0)) {
      toast.error("Please enter a valid circumference.");
      return;
    }

    setSaving(true);
    try {
      await createMeasurement({
        date: newDate,
        weight,
        circumference,
      });
      toast.success("Entry created successfully!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create entry. Date may already exist.");
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
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Measurement</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-date">Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-weight">Weight (kg)</Label>
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
                  Circumference (cm){" "}
                  <span className="text-muted-foreground text-xs">
                    optional
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No entries yet. Click &quot;New Entry&quot; to add one.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead className="text-right">Circ.</TableHead>
                <TableHead className="text-center">Photo</TableHead>
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
