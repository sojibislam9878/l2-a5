import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CircleCheck,
  CircleSlash,
  Mail,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProfileForm from "./profile-form";
import TechnicianProfileForm from "./technician-profile-form";
import AvailabilityForm from "./availability-form";
import { getCurrentUser } from "@/lib/dal";
import { initialsOf } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your FixItNow account details.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const roleLabels = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

const ProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/profile");
  }

  const isActive = user.status === "unban";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your personal details and see your account status.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-24 bg-brand/10">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:32px_32px]"
          />
        </div>
        <div className="-mt-10 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card">
              <AvatarFallback className="bg-brand text-xl font-semibold text-brand-foreground">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {user.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <Badge variant="secondary" className="bg-brand/10 text-brand">
              {roleLabels[user.role]}
            </Badge>
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }
            >
              {isActive ? (
                <CircleCheck className="size-3" />
              ) : (
                <CircleSlash className="size-3" />
              )}
              {isActive ? "Active" : "Suspended"}
            </Badge>
          </div>
        </div>
      </section>

      {!isActive && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Your account is suspended. You cannot book services or manage jobs
          until an admin restores access.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:gap-8">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-6 space-y-1">
            <h2 className="font-semibold tracking-tight">Personal details</h2>
            <p className="text-sm text-muted-foreground">
              Changes are saved to your account immediately.
            </p>
          </div>
          <ProfileForm user={user} />
        </section>

        <aside className="space-y-5 rounded-2xl border bg-card p-6 lg:h-fit">
          <h2 className="font-semibold tracking-tight">Account</h2>

          <dl className="space-y-4 text-sm">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Member since
              </dt>
              <dd className="font-medium">
                {dateFormatter.format(new Date(user.createdAt))}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5" />
                Email
              </dt>
              <dd className="truncate font-medium">{user.email}</dd>
            </div>

            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="size-3.5" />
                Phone
              </dt>
              <dd className="font-medium">
                {user.phone_no || (
                  <span className="font-normal text-muted-foreground">
                    Not provided
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <p className="border-t pt-4 text-xs text-muted-foreground">
            Your role determines what you can do on FixItNow and can only be
            changed by an admin.
          </p>
        </aside>
      </div>

      {user.role === "technician" && (
        <>
          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-6 space-y-1">
              <h2 className="font-semibold tracking-tight">Service profile</h2>
              <p className="text-sm text-muted-foreground">
                What customers see when they browse your services.
              </p>
            </div>

            {user.technician_profile ? (
              <TechnicianProfileForm profile={user.technician_profile} />
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Your technician profile could not be loaded. Try refreshing the
                page.
              </p>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-6 space-y-1">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <CalendarClock className="size-4 text-brand" />
                Weekly availability
              </h2>
              <p className="text-sm text-muted-foreground">
                Customers can only book time inside these hours. Saving replaces
                your whole weekly schedule.
              </p>
            </div>

            <AvailabilityForm
              availability={user.technician_profile?.availability ?? []}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
