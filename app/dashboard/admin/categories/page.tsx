import type { Metadata } from "next";
import Link from "@/components/link";
import { redirect } from "next/navigation";
import { FolderOpen, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryDialog from "./category-dialog";
import CategoryDeleteButton from "./category-delete-button";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { visualForCategory } from "@/lib/category-visuals";
import type { AdminCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage the service categories technicians can list under.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const AdminCategoriesPage = async () => {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/auth/login?redirect=/dashboard/admin/categories");
  }

  if (viewer.role !== "admin") {
    redirect(`/dashboard/${viewer.role}`);
  }

  let categories: AdminCategory[];

  try {
    categories =
      (await apiRequest<AdminCategory[]>("/api/admin/categories", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Categories
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load categories</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const totalServices = categories.reduce(
    (sum, category) => sum + category._count.service,
    0,
  );
  const unused = categories.filter(
    (category) => category._count.service === 0,
  ).length;

  const stats = [
    { label: "Categories", value: String(categories.length) },
    { label: "Services listed", value: String(totalServices) },
    { label: "Unused", value: String(unused) },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Technicians pick one of these when listing a service.
          </p>
        </div>
        <CategoryDialog />
      </header>

      <dl className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <FolderOpen className="size-8 text-muted-foreground" />
          <p className="font-medium">No categories yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Technicians cannot list a service until at least one category
            exists.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {categories.map((category) => {
            const { icon: Icon, tint } = visualForCategory(category.name);
            const count = category._count.service;

            return (
              <li key={category.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold tracking-tight">
                        {category.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {dateFormatter.format(new Date(category.created_at))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {count > 0 ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/services?category_id=${category.id}`}
                          className="text-brand"
                        >
                          {count} {count === 1 ? "service" : "services"}
                        </Link>
                      </Button>
                    ) : (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        No services
                      </span>
                    )}
                    <CategoryDialog category={category} />
                    <CategoryDeleteButton
                      categoryId={category.id}
                      name={category.name}
                      serviceCount={count}
                    />
                  </div>
                </div>

                <p className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
