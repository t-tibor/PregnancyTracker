"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { updateMeasurement, deleteMeasurement } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface EntryDetailProps {
  date: string;
  weight: number;
  circumference: number | null;
  imagePath: string | null;
}

export function EntryDetail({
  date,
  weight: initialWeight,
  circumference: initialCircumference,
  imagePath: initialImagePath,
}: EntryDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [weight, setWeight] = useState(initialWeight.toFixed(1));
  const [circumference, setCircumference] = useState(
    initialCircumference != null ? initialCircumference.toFixed(1) : ""
  );
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function handleCancel() {
    setWeight(initialWeight.toFixed(1));
    setCircumference(
      initialCircumference != null ? initialCircumference.toFixed(1) : ""
    );
    setImagePath(initialImagePath);
    setImageFile(null);
    setEditing(false);
  }

  async function handleSave() {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      toast.error("Please enter a valid weight.");
      return;
    }

    const c = circumference ? parseFloat(circumference) : null;
    if (c !== null && (isNaN(c) || c <= 0)) {
      toast.error("Please enter a valid circumference.");
      return;
    }

    setSaving(true);
    try {
      let uploadedPath = imagePath;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("date", date);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedPath = data.path;
        } else {
          toast.error("Image upload failed.");
          setSaving(false);
          return;
        }
      }

      await updateMeasurement(date, {
        weight: w,
        circumference: c,
        imagePath: uploadedPath,
      });

      toast.success("Entry updated successfully!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMeasurement(date);
      toast.success("Entry deleted.");
      router.push("/entries");
      router.refresh();
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/entries")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary flex-1">
          ⚙️ Entry Detail
        </h1>
        {!editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Properties */}
      <div className="flex flex-col gap-4">
        {/* Date (always read-only) */}
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-sm">Date</Label>
          <p className="text-lg font-medium">{formatDate(date)}</p>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="detail-weight" className="text-muted-foreground text-sm">
            Weight (kg)
          </Label>
          {editing ? (
            <Input
              id="detail-weight"
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          ) : (
            <p className="text-lg font-medium">{initialWeight.toFixed(1)} kg</p>
          )}
        </div>

        {/* Circumference */}
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="detail-circumference"
            className="text-muted-foreground text-sm"
          >
            Circumference (cm)
          </Label>
          {editing ? (
            <Input
              id="detail-circumference"
              type="number"
              step="0.1"
              min="0"
              value={circumference}
              onChange={(e) => setCircumference(e.target.value)}
              placeholder="—"
            />
          ) : (
            <p className="text-lg font-medium">
              {initialCircumference != null
                ? `${initialCircumference.toFixed(1)} cm`
                : "—"}
            </p>
          )}
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-sm">Photo</Label>
          {imagePath ? (
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden border">
              <Image
                src={imagePath}
                alt={`Belly photo for ${date}`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No photo</p>
          )}
          {editing && (
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePath(URL.createObjectURL(file));
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the measurement for{" "}
            <strong>{formatDate(date)}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
