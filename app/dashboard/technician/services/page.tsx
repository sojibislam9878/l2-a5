import type { Metadata } from "next";
import Link from "@/components/link";
import { redirect } from "next/navigation";
import { PackageOpen, ServerCrash, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceDialog from "./service-dialog";
import ServiceDeleteButton from "./service-delete-button";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { averageRating, formatPrice } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { Category, Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "My services",
  description: "Create and manage the services you offer on FixItNow.",
};

const ServicesPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/technician/services");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  const profileId = user.technician_profile?.id;

  const [services, categories] = await Promise.all([
    profileId
      ? apiRequest<Service[]>(`/api/services?technician_id=${profileId}`, {
          cache: "no-store",
        }).catch(() => null)
      : Promise.resolve([]),
    apiRequest<Category[]>("/api/categories", { revalidate: 300 }).catch(
      () => [],
    ),
  ]);

  if (services === null) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My services
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load your services</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const list = services ?? [];
  const categoryList = categories ?? [];

  const totalReviews = list.reduce((sum, item) => sum + item.review.length, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My services
          </h1>
          <p className="text-sm text-muted-foreground">
            {list.length === 0
              ? "You have not listed any services yet."
              : `${list.length} ${list.length === 1 ? "service" : "services"} listed · ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`}
          </p>
        </div>
        <ServiceDialog categories={categoryList} />
      </header>

      {categoryList.length === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No service categories exist yet, so a service cannot be created. An
          admin needs to add categories first.
        </p>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <PackageOpen className="size-8 text-muted-foreground" />
          <p className="font-medium">No services yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first service so customers can find and book you. You
            can edit the details at any time.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((service) => {
            const { icon: Icon, tint } = visualForCategory(
              service.category.name,
            );
            const rating = averageRating(service.review);
            const price = formatPrice(service.price);

            return (
              <li key={service.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {service.category.name}
                      </p>
                      <h2 className="font-semibold leading-snug tracking-tight text-balance">
                        {service.title}
                      </h2>
                    </div>
                  </div>
                  {price && (
                    <span className="text-lg font-semibold tracking-tight">
                      {price}
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  {rating !== null ? (
                    <span className="flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      <Star className="size-3 fill-brand text-brand" />
                      {rating.toFixed(1)} ({service.review.length})
                    </span>
                  ) : (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      No reviews yet
                    </span>
                  )}

                  <div className="flex gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/services/${service.id}`}>View public page</Link>
                    </Button>
                    <ServiceDialog
                      categories={categoryList}
                      service={service}
                    />
                    <ServiceDeleteButton
                      serviceId={service.id}
                      title={service.title}
                      bookingCount={service._count.booking}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ServicesPage;
