import { redirect } from "next/navigation";

const CustomerDashboardPage = () => {
  redirect("/dashboard/customer/bookings");
};

export default CustomerDashboardPage;
