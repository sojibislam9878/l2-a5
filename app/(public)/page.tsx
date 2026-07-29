import { Suspense } from "react";
import Link from "@/components/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceCard from "@/components/service-card";
import HeroVisual from "@/components/hero-visual";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { visualForCategory } from "@/lib/category-visuals";
import type { Category, Service, TechnicianSummary } from "@/lib/types";

const steps = [
  {
    icon: Search,
    title: "Find a service",
    description:
      "Browse by category, compare prices, and read reviews left by real customers.",
  },
  {
    icon: CalendarCheck,
    title: "Book a slot",
    description:
      "Pick a time from the technician's live weekly availability. No phone tag.",
  },
  {
    icon: CreditCard,
    title: "Pay when accepted",
    description:
      "Checkout securely through Stripe only after your technician confirms.",
  },
];

const CardsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between border-t pt-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const StatsBand = async () => {
  const [services, technicians, categories] = await Promise.all([
    apiRequest<Service[]>("/api/services", { revalidate: 300 }).catch(() => []),
    apiRequest<TechnicianSummary[]>("/api/technicians", {
      revalidate: 300,
    }).catch(() => []),
    apiRequest<Category[]>("/api/categories", { revalidate: 300 }).catch(
      () => [],
    ),
  ]);

  const stats = [
    { value: technicians?.length ?? 0, label: "Verified technicians" },
    { value: services?.length ?? 0, label: "Services listed" },
    { value: categories?.length ?? 0, label: "Service categories" },
    { value: "24/7", label: "Request a booking" },
  ];

  return (
    <dl className="grid grid-cols-2 divide-x divide-y divide-border border-t sm:grid-cols-4 sm:divide-y-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 px-4 py-6 text-center sm:px-6"
        >
          <dt className="order-2 text-xs text-muted-foreground sm:text-sm">
            {stat.label}
          </dt>
          <dd className="order-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// Mirrors CategoryGrid's shape exactly — a service-card skeleton here collapses
// to rows less than half its height, which reads as a jump on a single-column phone.
const CategoriesSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 rounded-xl border bg-card p-4"
      >
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="size-4 shrink-0 rounded-sm" />
      </div>
    ))}
  </div>
);

const CategoryGrid = async () => {
  const categories =
    (await apiRequest<Category[]>("/api/categories", {
      revalidate: 300,
    }).catch(() => [])) ?? [];

  if (!categories.length) {
    return null;
  }

  return (
    // grid-cols-1 is load-bearing: without it the implicit `auto` track takes its
    // base size from min-content, and `truncate`'s nowrap makes that the whole
    // sentence — blowing the track past the container. minmax(0,1fr) clamps it.
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.slice(0, 6).map((category) => {
        const { icon: Icon, tint } = visualForCategory(category.name);

        return (
          <Link
            key={category.id}
            href={`/services?category_id=${category.id}`}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tint}`}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {category.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {category.description}
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </Link>
        );
      })}
    </div>
  );
};

const FeaturedServices = async () => {
  const user = await getCurrentUser();
  let services: Service[] = [];

  try {
    services =
      (await apiRequest<Service[]>("/api/services?sortBy=price&sortOrder=asc", {
        revalidate: 60,
      })) ?? [];
  } catch {
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Services are unavailable right now. Please try again shortly.
      </p>
    );
  }

  if (!services.length) {
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No services have been listed yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.slice(0, 6).map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isAuthenticated={Boolean(user)}
        />
      ))}
    </div>
  );
};

const HomePage = () => {
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="absolute -top-48 -left-32 -z-10 size-[36rem] rounded-full bg-brand/10 blur-3xl"
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-brand" />
                Vetted technicians, transparent pricing
              </span>

              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
                Home repairs, handled by people you can{" "}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">trust</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1.5 -z-0 h-3 rounded-sm bg-brand/25"
                  />
                </span>
                .
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Plumbing, electrical, cleaning and more. Compare rates, book a
                real time slot, and pay securely once the job is accepted.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground shadow-sm shadow-brand/25 hover:bg-brand/90"
                >
                  <Link href="/services">
                    Browse services
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/register">
                    <Wrench />
                    Join as a technician
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-brand" />
                  Reviews from real bookings
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="size-4 text-brand" />
                  Secure Stripe checkout
                </span>
              </div>
            </div>

            <div className="lg:pl-4">
              <HeroVisual />
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <StatsBand />
        </Suspense>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-lg space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Browse by category
          </h2>
          <p className="text-sm text-muted-foreground">
            Whatever needs fixing, there is someone here who does it for a
            living.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoryGrid />
          </Suspense>
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-lg space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Featured services
              </h2>
              <p className="text-sm text-muted-foreground">
                Popular jobs from technicians accepting bookings right now.
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-brand hover:text-brand"
            >
              <Link href="/services">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <Suspense fallback={<CardsSkeleton />}>
              <FeaturedServices />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Three steps from problem to fixed
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              No quotes over the phone, no waiting to hear back. You always know
              exactly where your booking stands.
            </p>
          </div>

          <ol className="relative space-y-8">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[1.375rem] w-px bg-border"
            />
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-5">
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card text-brand shadow-sm">
                  <step.icon className="size-5" />
                </span>
                <div className="space-y-1.5 pt-1">
                  <h3 className="flex items-center gap-2 font-medium">
                    <span className="text-xs font-normal text-muted-foreground">
                      Step {index + 1}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border bg-neutral-950 px-6 py-14 text-neutral-100 sm:px-12 lg:px-16">
          <div
            aria-hidden
            className="absolute -top-28 -left-20 size-80 rounded-full bg-brand/25 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -right-20 size-80 rounded-full bg-rose-500/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />

          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg space-y-4">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Ready to get it fixed?
              </h2>
              <p className="text-[0.95rem] leading-relaxed text-neutral-400">
                Create a free account to book a technician, track your job from
                request to receipt, and leave a review when it&apos;s done.
              </p>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Star className="size-3 fill-brand text-brand" />
                Only customers with a completed booking can review
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/auth/register">Create an account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-neutral-100 hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">
                  Sign in
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
