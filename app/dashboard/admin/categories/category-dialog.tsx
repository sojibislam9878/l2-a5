"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, OctagonAlert, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/categories";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { AdminCategory } from "@/lib/types";

const CategoryDialog = ({ category }: { category?: AdminCategory }) => {
  const isEdit = Boolean(category);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaults: CategoryInput = {
    name: category?.name ?? "",
    description: category?.description ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults,
  });

  const onSubmit = (values: CategoryInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, values)
        : await createCategoryAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      toast.success(isEdit ? "Category updated." : "Category created.");
      setOpen(false);

      if (!isEdit) {
        reset({ name: "", description: "" });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormError(null);
          reset(defaults);
        }
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil />
            Edit
          </Button>
        ) : (
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus />
            New category
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit category" : "Create a category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Renaming a category updates it everywhere it is shown."
              : "Technicians pick a category when listing a service."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            {formError && (
              <Alert variant="destructive">
                <OctagonAlert />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="Plumbing"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldDescription>
                Must be unique across all categories.
              </FieldDescription>
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                rows={4}
                placeholder="Pipe, drain and water related services."
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {isEdit && (category?._count.service ?? 0) > 0 && (
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {category?._count.service}{" "}
                {category?._count.service === 1 ? "service uses" : "services use"}{" "}
                this category. Changes will show on those listings immediately.
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isPending && <Loader2 className="animate-spin" />}
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
