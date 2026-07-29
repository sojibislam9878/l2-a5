import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerBookings from "./customer-bookings";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Track the services you have booked on FixItNow.",
};

const CustomerBookingsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/customer/bookings");
  }

  if (user.role !== "customer" && user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  return <CustomerBookings />;
};

export default CustomerBookingsPage;
