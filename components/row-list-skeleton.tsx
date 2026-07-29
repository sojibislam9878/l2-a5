import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for the admin list pages. `divided` matches the single bordered
 * card used for users; the default matches the separate stacked cards used for
 * bookings, so the skeleton keeps the same footprint as the real list.
 */
const RowListSkeleton = ({
  count = 6,
  divided = false,
}: {
  count?: number;
  divided?: boolean;
}) => {
  const rows = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`flex flex-wrap items-center gap-4 sm:flex-nowrap ${
        divided ? "p-4" : "rounded-2xl border bg-card p-5"
      }`}
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
      <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
      <Skeleton className="h-8 w-20 shrink-0" />
    </div>
  ));

  return (
    <>
      <Skeleton className="h-4 w-28" />
      {divided ? (
        <div className="mt-5 divide-y rounded-2xl border bg-card">{rows}</div>
      ) : (
        <div className="mt-5 space-y-4">{rows}</div>
      )}
    </>
  );
};

export default RowListSkeleton;
