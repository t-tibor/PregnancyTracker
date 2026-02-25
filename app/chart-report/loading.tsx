import { Skeleton } from "@/components/ui/skeleton";

export default function ChartReportLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />

      {/* Chart tab buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Chart area */}
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-[300px] w-full rounded-md" />
      </div>
    </div>
  );
}
