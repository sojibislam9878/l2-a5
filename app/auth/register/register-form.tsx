"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  OctagonAlert,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "./actions";

const roleOptions = [
  {
    value: "customer" as const,
    label: "Book a service",
    description: "I need a technician",
    icon: UserRound,
  },
  {
    value: "technician" as const,
    label: "Offer a service",
    description: "I want to take jobs",
    icon: Wrench,
  },
];

const RegisterForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      password: "",
      confirmPassword: "",
      role: "customer",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      toast.success("Account created. Please sign in to continue.");
      router.push("/auth/login");
    });
  };

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            Sign in
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

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.role)}>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {roleOptions.map((option) => {
                    const isSelected = field.value === option.value;

                    return (
                      <FieldLabel
                        key={option.value}
                        htmlFor={option.value}
                        className="relative cursor-pointer rounded-xl border bg-card p-3.5 transition-all hover:border-brand/40 has-data-checked:border-brand has-data-checked:bg-brand/5 has-data-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-brand/40 has-focus-visible:ring-offset-2"
                      >
                        <RadioGroupItem
                          id={option.value}
                          value={option.value}
                          className="sr-only"
                        />
                        <span className="flex flex-col gap-2.5">
                          <span className="flex items-center justify-between">
                            <span
                              className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                                isSelected
                                  ? "bg-brand text-brand-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <option.icon className="size-4" />
                            </span>
                            {isSelected && (
                              <span className="flex size-4 items-center justify-center rounded-full bg-brand text-brand-foreground">
                                <Check className="size-3" strokeWidth={3} />
                              </span>
                            )}
                          </span>
                          <span className="space-y-0.5">
                            <span className="block text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </FieldLabel>
                    );
                  })}
                </RadioGroup>
                <FieldError errors={[errors.role]} />
              </Field>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                placeholder="John Doe"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.phone_no)}>
              <FieldLabel htmlFor="phone_no">Phone</FieldLabel>
              <Input
                id="phone_no"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01700000000"
                aria-invalid={Boolean(errors.phone_no)}
                {...register("phone_no")}
              />
              <FieldError errors={[errors.phone_no]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
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
                autoComplete="new-password"
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
            <FieldDescription>
              At least 8 characters, with a letter and a number.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              suppressHydrationWarning
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full bg-brand text-brand-foreground shadow-sm shadow-brand/25 hover:bg-brand/90"
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Creating account..." : "Create account"}
          </Button>

          <FieldDescription className="text-center text-xs">
            By creating an account you agree to our terms of service and privacy
            policy.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
};

export default RegisterForm;
