"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, OctagonAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { updateProfileAction } from "@/lib/actions/profile";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import type { User } from "@/lib/types";

const ProfileForm = ({ user }: { user: User }) => {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone_no: user.phone_no ?? "",
    },
  });

  const onSubmit = (values: ProfileInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      reset({
        name: result.user.name,
        phone_no: result.user.phone_no ?? "",
      });
      toast.success("Profile updated.");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        {formError && (
          <Alert variant="destructive">
            <OctagonAlert />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly
              disabled
              tabIndex={-1}
              suppressHydrationWarning
              className="pr-9"
            />
            <Lock className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FieldDescription>
            Your email is your sign-in identifier and cannot be changed.
          </FieldDescription>
        </Field>

        <Field data-invalid={Boolean(errors.phone_no)}>
          <FieldLabel htmlFor="phone_no">Phone number</FieldLabel>
          <Input
            id="phone_no"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01700000000"
            aria-invalid={Boolean(errors.phone_no)}
            {...register("phone_no")}
          />
          <FieldDescription>
            Leave empty to remove it. Technicians use this to reach you.
          </FieldDescription>
          <FieldError errors={[errors.phone_no]} />
        </Field>

        <div className="flex items-center gap-3 border-t pt-5">
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isPending ? "Saving..." : "Save changes"}
          </Button>
          {isDirty && !isPending && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setFormError(null);
              }}
            >
              Discard
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
};

export default ProfileForm;
