"use client";

import { useState, useCallback, useTransition } from "react";
import { DigitRoller } from "@/components/digit-roller";
import { ImageEditor } from "@/components/image-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMeasurement, updateMeasurement } from "@/app/actions";
import { toast } from "sonner";
import { Loader2, Save, Pencil } from "lucide-react";

interface MeasurementData {
  date: string;
  weight: number;
  circumference: number | null;
  imagePath: string | null;
}

interface DailyEntryProps {
  today: string;
  existing: MeasurementData | null;
  defaultWeight: number;
  defaultCircumference: number;
}

export function DailyEntry({
  today,
  existing,
  defaultWeight,
  defaultCircumference,
}: DailyEntryProps) {
  const [isEditing, setIsEditing] = useState(!existing);
  const [weight, setWeight] = useState(existing?.weight ?? defaultWeight);
  const [circumference, setCircumference] = useState(
    existing?.circumference ?? defaultCircumference
  );
  const [imagePath, setImagePath] = useState<string | null>(
    existing?.imagePath ?? null
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [activeSlide, setActiveSlide] = useState(0);
  const slides = ["Testsúly", "Körfogat", "Fotó"];

  const handleImageSelected = useCallback((file: File) => {
    setPendingFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        let uploadedPath = imagePath;

        // Upload image if a new file was selected
        if (pendingFile) {
          const formData = new FormData();
          formData.append("file", pendingFile);
          formData.append("date", today);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || "Sikertelen képfeltöltés");
            return;
          }
          const data = await res.json();
          uploadedPath = data.path;
        }

        if (existing) {
          await updateMeasurement(today, {
            weight,
            circumference,
            imagePath: uploadedPath,
          });
          toast.success("Mérés frissítve!");
        } else {
          await createMeasurement({
            date: today,
            weight,
            circumference,
            imagePath: uploadedPath,
          });
          toast.success("Mérés mentve!");
        }

        setImagePath(uploadedPath);
        setPendingFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setIsEditing(false);
      } catch {
        toast.error("Sikertelen mentés");
      }
    });
  }, [weight, circumference, imagePath, pendingFile, previewUrl, today, existing]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const displayImagePath = previewUrl || imagePath;

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-primary">🤰 Napi Mérés</h1>

      {/* Slide indicators */}
      <div className="flex items-center gap-2">
        {slides.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveSlide(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              activeSlide === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Carousel content */}
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center py-8">
          {activeSlide === 0 && (
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Testsúly
              </h2>
              <DigitRoller
                value={weight}
                onChange={setWeight}
                unit="kg"
                readonly={!isEditing}
                integerDigits={2}
                min={30}
                max={150}
              />
            </div>
          )}

          {activeSlide === 1 && (
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Körfogat
              </h2>
              <DigitRoller
                value={circumference ?? defaultCircumference}
                onChange={setCircumference}
                unit="cm"
                readonly={!isEditing}
                integerDigits={2}
                min={40}
                max={150}
              />
            </div>
          )}

          {activeSlide === 2 && (
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Fotó
              </h2>
              <ImageEditor
                imagePath={displayImagePath}
                readonly={!isEditing}
                onImageSelected={handleImageSelected}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action button */}
      {isEditing ? (
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isPending}
          className="w-full max-w-sm cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Mentés..." : "Mentés"}
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          onClick={handleEdit}
          className="w-full max-w-sm cursor-pointer"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Szerkesztés
        </Button>
      )}
    </div>
  );
}
