"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "./actions";

const LoginForm = ({ redirectTo }: { redirectTo?: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = await loginAction(values, redirectTo);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      toast.success("Welcome back.");
      router.replace(result.redirectTo);
    });
  };

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          New to FixItNow?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            Create an account
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {formError && (
            <Alert variant="destructive">
              <OctagonAlert />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              autoFocus
              suppressHydrationWarning
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                suppressHydrationWarning
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute inset-y-0 right-1 my-auto text-muted-foreground"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full bg-brand text-brand-foreground shadow-sm shadow-brand/25 hover:bg-brand/90"
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default LoginForm;
