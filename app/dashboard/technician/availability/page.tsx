import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AvailabilityForm from "./availability-form";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Availability",
  description: "Set the weekly hours customers can book you in.",
};

const AvailabilityPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/technician/availability");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Weekly availability
        </h1>
        <p className="text-sm text-muted-foreground">
          Customers can only book time inside these hours. Saving replaces your
          whole weekly schedule.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6">
        <AvailabilityForm
          availability={user.technician_profile?.availability ?? []}
        />
      </section>
    </div>
  );
};

export default AvailabilityPage;
