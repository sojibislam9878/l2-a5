import type { LucideIcon } from "lucide-react";

const StatusPage = ({
  icon: Icon,
  code,
  title,
  description,
  children,
  tone = "muted",
}: {
  icon: LucideIcon;
  code?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  tone?: "muted" | "destructive";
}) => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
      <span
        className={`flex size-14 items-center justify-center rounded-full ${
          tone === "destructive"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="size-7" />
      </span>

      <div className="space-y-2">
        {code && (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {code}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {children && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {children}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
