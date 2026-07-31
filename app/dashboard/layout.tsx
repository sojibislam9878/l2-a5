import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/site-header";
import DashboardNav from "@/components/dashboard-nav";
import DashboardScope from "@/components/dashboard-scope";
import { getCurrentUser } from "@/lib/dal";
import { ROLE_LABELS, initialsOf } from "@/lib/format";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <div className="flex-1 bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="hidden items-center gap-3 px-1 lg:flex">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-brand/12 text-sm font-medium text-brand">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold tracking-tight">
                      {user.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-brand/10 px-1.5 py-0 text-[0.65rem] text-brand"
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </div>

                {user.role === "technician" && (
                  <>
                    <Separator className="hidden lg:block" />
                    <DashboardScope />
                  </>
                )}

                <Separator />
                <DashboardNav role={user.role} />
              </div>
            </aside>

            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
