"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";
import type { Category, Service } from "@/lib/types";

type Props = {
  categories: Category[];
  service?: Service;
};

const ServiceDialog = ({ categories, service }: Props) => {
  const isEdit = Boolean(service);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaults: ServiceInput = {
    category_id: service?.category_id ?? "",
    title: service?.title ?? "",
    description: service?.description ?? "",
    price: service?.price ?? "",
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaults,
  });

  const onSubmit = (values: ServiceInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = service
        ? await updateServiceAction(service.id, values)
        : await createServiceAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      toast.success(isEdit ? "Service updated." : "Service created.");
      setOpen(false);

      if (!isEdit) {
        reset({ category_id: "", title: "", description: "", price: "" });
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
            New service
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "Create a service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes appear immediately wherever this service is listed."
              : "Describe what you offer so customers can find and book it."}
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

            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.category_id)}>
                  <FieldLabel htmlFor="category_id">Category</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category_id" className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.category_id]} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Emergency pipe repair"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                rows={4}
                placeholder="What is included, how long it takes, anything the customer should prepare."
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={Boolean(errors.price)}>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="60.00"
                  className="pl-7"
                  aria-invalid={Boolean(errors.price)}
                  {...register("price")}
                />
              </div>
              <FieldDescription>
                A flat price for this service, separate from your hourly rate.
              </FieldDescription>
              <FieldError errors={[errors.price]} />
            </Field>

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
                  : "Create service"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
