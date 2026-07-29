import Link from "next/link";
import { CalendarClock, ShieldCheck, Star, Wrench } from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Vetted professionals",
    description: "Every technician is reviewed before taking jobs.",
  },
  {
    icon: CalendarClock,
    title: "Book a real time slot",
    description: "Pick from live availability, no phone tag.",
  },
  {
    icon: Star,
    title: "Pay once it's done",
    description: "Secure checkout, only after your job is accepted.",
  },
];

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-neutral-100 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_75%_60%_at_30%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-24 size-[26rem] rounded-full bg-brand/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -right-24 size-[24rem] rounded-full bg-rose-500/15 blur-3xl"
        />

        <Link
          href="/"
          className="relative flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-lg shadow-brand/25">
            <Wrench className="size-4.5" />
          </span>
          FixItNow
        </Link>

        <div className="relative max-w-md space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-balance">
              Home repairs, handled by people you can trust.
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-neutral-400">
              Plumbing, electrical, appliance fixes and more — compare rates,
              book a slot, and track the job from request to receipt.
            </p>
          </div>

          <ul className="space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <item.icon className="size-4 text-brand" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm leading-snug text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-neutral-400">
          <div className="flex -space-x-2">
            {["bg-brand/80", "bg-rose-500/70", "bg-sky-500/70"].map((tone) => (
              <span
                key={tone}
                className={`size-7 rounded-full border-2 border-neutral-950 ${tone}`}
              />
            ))}
          </div>
          <p>Trusted by homeowners and technicians alike.</p>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-[26rem]">
          <Link
            href="/"
            className="mb-8 flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Wrench className="size-4.5" />
            </span>
            FixItNow
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
