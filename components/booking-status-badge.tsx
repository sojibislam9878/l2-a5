import { STATUS_META, type DerivedStatus } from "@/lib/booking-status";

const BookingStatusBadge = ({
  status,
  className = "",
}: {
  status: DerivedStatus;
  className?: string;
}) => {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.tone} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

export default BookingStatusBadge;
