import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardProfile from "@/components/dashboard-profile";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your FixItNow account details.",
};

const TechnicianProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/technician");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  return <DashboardProfile user={user} />;
};

export default TechnicianProfilePage;
