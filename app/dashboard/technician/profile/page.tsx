import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TechnicianProfileForm from "./technician-profile-form";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Service profile",
  description: "Your bio, skills, experience and hourly rate.",
};

const TechnicianProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/technician/profile");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Service profile
        </h1>
        <p className="text-sm text-muted-foreground">
          What customers see when they browse your services. Your name, email
          and phone live under{" "}
          <span className="font-medium text-foreground">Account</span>.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6">
        {user.technician_profile ? (
          <TechnicianProfileForm profile={user.technician_profile} />
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Your technician profile could not be loaded. Try refreshing the
            page.
          </p>
        )}
      </section>
    </div>
  );
};

export default TechnicianProfilePage;
