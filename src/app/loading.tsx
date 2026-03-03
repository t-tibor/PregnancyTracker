import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Title */}
      <Skeleton className="h-8 w-48" />

      {/* Slide indicators */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      {/* Card with digit roller placeholder */}
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center py-8 gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-32 w-48 rounded-lg" />
        </CardContent>
      </Card>

      {/* Action button */}
      <Skeleton className="h-11 w-full max-w-sm rounded-md" />
    </div>
  );
}
