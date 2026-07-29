import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardProfile from "@/components/dashboard-profile";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your FixItNow account details.",
};

const AdminProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/admin");
  }

  if (user.role !== "admin") {
    redirect(`/dashboard/${user.role}`);
  }

  return <DashboardProfile user={user} />;
};

export default AdminProfilePage;
