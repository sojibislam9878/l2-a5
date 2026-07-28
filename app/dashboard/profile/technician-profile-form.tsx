"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, OctagonAlert, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { updateTechnicianProfileAction } from "@/lib/actions/technician-profile";
import {
  technicianProfileSchema,
  type TechnicianProfileInput,
} from "@/lib/validations/technician-profile";
import type { TechnicianProfileDetail } from "@/lib/types";

const TechnicianProfileForm = ({
  profile,
}: {
  profile: TechnicianProfileDetail;
}) => {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [skillDraft, setSkillDraft] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TechnicianProfileInput>({
    resolver: zodResolver(technicianProfileSchema),
    defaultValues: {
      bio: profile.bio ?? "",
      skills: profile.skills,
      experience_year:
        profile.experience_year === null ? "" : String(profile.experience_year),
      hourly_rate: profile.hourly_rate ?? "",
    },
  });

  const onSubmit = (values: TechnicianProfileInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = await updateTechnicianProfileAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      reset({
        bio: result.profile.bio ?? "",
        skills: result.profile.skills,
        experience_year:
          result.profile.experience_year === null
            ? ""
            : String(result.profile.experience_year),
        hourly_rate: result.profile.hourly_rate ?? "",
      });
      setSkillDraft("");
      toast.success("Service profile updated.");
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

        <Field data-invalid={Boolean(errors.bio)}>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Tell customers about your experience and what you specialise in."
            aria-invalid={Boolean(errors.bio)}
            {...register("bio")}
          />
          <FieldDescription>
            Shown on your public profile and on every service you list.
          </FieldDescription>
          <FieldError errors={[errors.bio]} />
        </Field>

        <Controller
          control={control}
          name="skills"
          render={({ field }) => {
            const addSkill = () => {
              const value = skillDraft.trim();

              if (!value || field.value.includes(value)) {
                setSkillDraft("");
                return;
              }

              field.onChange([...field.value, value]);
              setSkillDraft("");
            };

            return (
              <Field data-invalid={Boolean(errors.skills)}>
                <FieldLabel htmlFor="skill-input">Skills</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="skill-input"
                    value={skillDraft}
                    onChange={(event) => setSkillDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. plumbing"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={!skillDraft.trim()}
                  >
                    <Plus />
                    Add
                  </Button>
                </div>

                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {field.value.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 rounded-full border bg-card py-1 pr-1.5 pl-3 text-xs font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() =>
                            field.onChange(
                              field.value.filter((item) => item !== skill),
                            )
                          }
                          className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                        >
                          <X className="size-2.5" strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <FieldDescription>
                  Press Enter or comma to add. Customers can filter services by
                  skill.
                </FieldDescription>
                <FieldError errors={[errors.skills]} />
              </Field>
            );
          }}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.experience_year)}>
            <FieldLabel htmlFor="experience_year">Years of experience</FieldLabel>
            <Input
              id="experience_year"
              type="number"
              inputMode="numeric"
              min={0}
              max={70}
              step={1}
              placeholder="5"
              aria-invalid={Boolean(errors.experience_year)}
              {...register("experience_year")}
            />
            <FieldError errors={[errors.experience_year]} />
          </Field>

          <Field data-invalid={Boolean(errors.hourly_rate)}>
            <FieldLabel htmlFor="hourly_rate">Hourly rate</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="hourly_rate"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="40.00"
                className="pl-7"
                aria-invalid={Boolean(errors.hourly_rate)}
                {...register("hourly_rate")}
              />
            </div>
            <FieldError errors={[errors.hourly_rate]} />
          </Field>
        </div>

        <div className="flex items-center gap-3 border-t pt-5">
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isPending ? "Saving..." : "Save service profile"}
          </Button>
          {isDirty && !isPending && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setSkillDraft("");
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

export default TechnicianProfileForm;
