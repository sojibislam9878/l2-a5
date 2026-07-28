import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerBookings from "./customer-bookings";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Track the services you have booked on FixItNow.",
};

const BookingsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/bookings");
  }

  if (user.role === "admin") {
    redirect("/dashboard/profile");
  }

  return <CustomerBookings />;
};

export default BookingsPage;
