import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function EntryDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <Separator />

      {/* Properties */}
      <div className="flex flex-col gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-56" />
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Circumference */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="w-full max-w-sm aspect-[3/4] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
