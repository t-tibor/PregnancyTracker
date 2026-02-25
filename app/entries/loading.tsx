import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EntriesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />

      {/* "New entry" button placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Table skeleton */}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-5 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-5 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-5 w-5 mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
