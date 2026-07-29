import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CircleCheck,
  CircleSlash,
  SearchX,
  ServerCrash,
  UserRound,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import UserFilters from "./user-filters";
import UserStatusButton from "@/components/user-status-button";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { initialsOf } from "@/lib/format";
import type { User } from "@/lib/types";

export const metadata: Metadata = {
  title: "All users",
  description: "Every customer and technician on FixItNow.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/auth/login?redirect=/dashboard/admin/users");
  }

  if (viewer.role !== "admin") {
    redirect(`/dashboard/${viewer.role}`);
  }

  const params = await searchParams;
  const q = first(params.q).toLowerCase();
  const roleFilter = ["customer", "technician"].includes(first(params.role))
    ? first(params.role)
    : "";
  const statusFilter = ["ban", "unban"].includes(first(params.status))
    ? first(params.status)
    : "";

  let users: User[];

  try {
    users =
      (await apiRequest<User[]>("/api/admin/users", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            All users
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load users</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const platformUsers = users.filter((user) => user.role !== "admin");

  const visible = platformUsers.filter((user) => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    if (
      q &&
      !user.name.toLowerCase().includes(q) &&
      !user.email.toLowerCase().includes(q)
    ) {
      return false;
    }

    return true;
  });

  const stats = [
    { label: "Users", value: platformUsers.length },
    {
      label: "Customers",
      value: platformUsers.filter((user) => user.role === "customer").length,
    },
    {
      label: "Technicians",
      value: platformUsers.filter((user) => user.role === "technician").length,
    },
    {
      label: "Banned",
      value: platformUsers.filter((user) => user.status === "ban").length,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          All users
        </h1>
        <p className="text-sm text-muted-foreground">
          Every customer and technician on the platform. Admin accounts are not
          listed.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <UserFilters q={first(params.q)} role={roleFilter} status={statusFilter} />

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-medium">No users match your filters</p>
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href="/dashboard/admin/users">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {visible.length}
            </span>{" "}
            of {platformUsers.length}
          </p>

          <ul className="divide-y rounded-2xl border bg-card">
            {visible.map((user) => {
              const isActive = user.status === "unban";
              const isTechnician = user.role === "technician";

              return (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback
                      className={
                        isTechnician
                          ? "bg-brand/12 text-xs font-medium text-brand"
                          : "bg-muted text-xs font-medium"
                      }
                    >
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1 sm:w-32">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      {isTechnician ? (
                        <Wrench className="size-3 text-brand" />
                      ) : (
                        <UserRound className="size-3 text-muted-foreground" />
                      )}
                      {isTechnician ? "Technician" : "Customer"}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-xs ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                    >
                      {isActive ? (
                        <CircleCheck className="size-3" />
                      ) : (
                        <CircleSlash className="size-3" />
                      )}
                      {isActive ? "Active" : "Banned"}
                    </span>
                  </div>

                  <p className="hidden text-xs text-muted-foreground lg:block lg:w-28">
                    Joined {dateFormatter.format(new Date(user.createdAt))}
                  </p>

                  <div className="flex shrink-0 gap-2">
                    <UserStatusButton
                      userId={user.id}
                      name={user.name}
                      status={user.status}
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/admin/users/${user.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
