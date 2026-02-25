"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X, Save, ImageMinus } from "lucide-react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { updateMeasurement, deleteMeasurement, deleteBlobImage, deleteImage } from "@/app/actions";
import { getBlobImageSrc } from "@/lib/utils";
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
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const [weight, setWeight] = useState(initialWeight.toFixed(1));
  const [circumference, setCircumference] = useState(
    initialCircumference != null ? initialCircumference.toFixed(1) : ""
  );
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
      "hu-HU",
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
      toast.error("Kérjük, adjon meg érvényes testsúlyt.");
      return;
    }

    const c = circumference ? parseFloat(circumference) : null;
    if (c !== null && (isNaN(c) || c <= 0)) {
      toast.error("Kérjük, adjon meg érvényes körfogatértéket.");
      return;
    }

    setSaving(true);
    try {
      let uploadedPath = imagePath;

      if (imageFile) {
        try {
          // Delete old blob before uploading new one
          if (initialImagePath) {
            await deleteBlobImage(initialImagePath);
          }
          const ext = imageFile.name.split(".").pop() || "jpg";
          const suffix = Math.random().toString(36).substring(2, 8);
          const blob = await upload(`${date}-${suffix}.${ext}`, imageFile, {
            access: "private",
            handleUploadUrl: "/api/upload",
          });
          uploadedPath = blob.url;
        } catch {
          toast.error("Képfeltöltés sikertelen.");
          setSaving(false);
          return;
        }
      }

      await updateMeasurement(date, {
        weight: w,
        circumference: c,
        imagePath: uploadedPath,
      });

      toast.success("Bejegyzés sikeresen frissítve!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Sikertelen frissítés.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMeasurement(date);
      toast.success("Bejegyzés törölve.");
      router.push("/entries");
      router.refresh();
    } catch {
      toast.error("Sikertelen törlés.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/entries">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            ⚙️ Bejegyzés részletei
          </h1>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Szerkesztés
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Törlés
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Properties */}
      <div className="flex flex-col gap-4">
        {/* Date (always read-only) */}
        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-sm">Dátum</Label>
          <p className="text-lg font-medium">{formatDate(date)}</p>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="detail-weight" className="text-muted-foreground text-sm">
            Testsúly (kg)
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
            Körfogat (cm)
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
          <Label className="text-muted-foreground text-sm">Fotó</Label>
          {imagePath ? (
            <>
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden border">
                <img
                  src={getBlobImageSrc(imagePath)}
                  alt={`Pocakfot\u00f3: ${date}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              {editing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit text-destructive hover:text-destructive"
                  onClick={() => setDeleteImageOpen(true)}
                >
                  <ImageMinus className="h-4 w-4 mr-1" />
                  Fotó törlése
                </Button>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Nincs fotó</p>
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
            {saving ? "Mentés…" : "Mentés"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Mégse
          </Button>
        </div>
      )}

      {/* Delete image confirmation dialog */}
      <Dialog open={deleteImageOpen} onOpenChange={setDeleteImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fotó törlése</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Biztosan törölni szeretné a fotót ehhez a bejegyzéshez: <strong>{formatDate(date)}</strong>? Ez a művelet nem vonható vissza.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Mégse</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                setDeletingImage(true);
                try {
                  await deleteImage(date);
                  setImagePath(null);
                  setDeleteImageOpen(false);
                  toast.success("Fotó törölve.");
                  router.refresh();
                } catch {
                  toast.error("Sikertelen fotó törlés.");
                } finally {
                  setDeletingImage(false);
                }
              }}
              disabled={deletingImage}
            >
              {deletingImage ? "Törlés…" : "Törlés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
              <DialogTitle>Bejegyzés törlése</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Biztosan törölni szeretné a mérést: <strong>{formatDate(date)}</strong>? Ez a művelet nem vonható vissza.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Mégse</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Törlés…" : "Törlés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
