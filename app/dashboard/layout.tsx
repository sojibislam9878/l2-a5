import { redirect } from "next/navigation";
import SiteHeader from "@/components/site-header";
import DashboardNav from "@/components/dashboard-nav";
import DashboardScope from "@/components/dashboard-scope";
import { getCurrentUser } from "@/lib/dal";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/profile");
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        {user.role === "technician" && (
          <div className="mb-8 max-w-2xl">
            <DashboardScope />
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[14rem_1fr] lg:gap-12">
          <DashboardNav role={user.role} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
