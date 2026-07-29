import Link from "@/components/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingDialog from "@/components/booking-dialog";
import type { Availability } from "@/lib/types";

const BookButton = ({
  serviceId,
  serviceTitle,
  availability,
  isAuthenticated,
  size = "lg",
  className = "w-full",
}: {
  serviceId: string;
  serviceTitle: string;
  availability: Availability[];
  isAuthenticated: boolean;
  size?: "sm" | "lg";
  className?: string;
}) => {
  if (!isAuthenticated) {
    return (
      <Button
        asChild
        size={size}
        className={`bg-brand text-brand-foreground hover:bg-brand/90 ${className}`}
      >
        <Link href={`/auth/login?redirect=/services/${serviceId}`}>
          <CalendarPlus />
          Book now
        </Link>
      </Button>
    );
  }

  return (
    <BookingDialog
      serviceId={serviceId}
      serviceTitle={serviceTitle}
      availability={availability}
      size={size}
      className={className}
    />
  );
};

export default BookButton;
