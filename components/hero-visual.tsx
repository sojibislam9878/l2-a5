import { BadgeCheck, Check, Clock, Droplets, Star } from "lucide-react";

const timeline = [
  { label: "Request sent", done: true },
  { label: "Technician accepted", done: true },
  { label: "Payment completed", done: true },
  { label: "Job in progress", done: false },
];

const HeroVisual = () => {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm lg:max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand/12 blur-2xl" />

      <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/40">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Droplets className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              Fix every pipe line in your house
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              Plumbing
              <span className="text-border">•</span>
              <Star className="size-3 fill-brand text-brand" />
              4.8
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-brand/10 px-2 py-1 text-sm font-semibold text-brand">
            $60
          </span>
        </div>

        <div className="mt-5 space-y-3 border-t pt-4">
          {timeline.map((step) => (
            <div key={step.label} className="flex items-center gap-2.5">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                  step.done
                    ? "bg-brand text-brand-foreground"
                    : "border-2 border-dashed border-border text-muted-foreground"
                }`}
              >
                {step.done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <Clock className="size-2.5" />
                )}
              </span>
              <span
                className={`text-sm ${
                  step.done ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-xl border bg-card p-3 shadow-lg shadow-black/5 sm:flex dark:shadow-black/40">
        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <BadgeCheck className="size-4" />
        </span>
        <span>
          <span className="block text-xs font-medium">Verified technician</span>
          <span className="block text-[0.7rem] text-muted-foreground">
            6 years experience
          </span>
        </span>
      </div>

      <div className="absolute -top-4 -right-4 hidden rounded-xl border bg-card px-3 py-2 shadow-lg shadow-black/5 sm:block dark:shadow-black/40">
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Accepting bookings
        </span>
      </div>
    </div>
  );
};

export default HeroVisual;
