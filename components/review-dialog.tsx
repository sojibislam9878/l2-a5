"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleCheck, Loader2, OctagonAlert, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { createReviewAction } from "@/lib/actions/reviews";
import { reviewSchema } from "@/lib/validations/review";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const ReviewDialog = ({
  bookingId,
  serviceTitle,
  technicianName,
  size = "sm",
  className = "",
}: {
  bookingId: string;
  serviceTitle: string;
  technicianName: string;
  size?: "sm" | "lg";
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setRating(0);
    setHover(0);
    setComment("");
    setErrors({});
    setFormError(null);
    setDone(false);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = reviewSchema.safeParse({ rating, comment });

    if (!parsed.success) {
      const next: { rating?: string; comment?: string } = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "rating") next.rating = issue.message;
        if (key === "comment") next.comment = issue.message;
      }

      setErrors(next);
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await createReviewAction(bookingId, parsed.data);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      setDone(true);
      toast.success("Thanks for your review.");
    });
  };

  const shown = hover || rating;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={size}
          className={`bg-brand text-brand-foreground hover:bg-brand/90 ${className}`}
        >
          <Star />
          Leave a review
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CircleCheck className="size-6" />
            </span>
            <DialogTitle>Review submitted</DialogTitle>
            <DialogDescription className="max-w-sm">
              Your rating is now shown on this service and on{" "}
              {technicianName}&apos;s profile.
            </DialogDescription>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Rate this service</DialogTitle>
              <DialogDescription className="line-clamp-2">
                {serviceTitle} · {technicianName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} noValidate>
              <FieldGroup className="gap-5">
                {formError && (
                  <Alert variant="destructive">
                    <OctagonAlert />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={Boolean(errors.rating)}>
                  <FieldLabel htmlFor="rating-1">Your rating</FieldLabel>
                  <div
                    role="radiogroup"
                    aria-label="Rating out of 5"
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHover(0)}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        id={`rating-${value}`}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                        onMouseEnter={() => setHover(value)}
                        onFocus={() => setHover(value)}
                        onClick={() => {
                          setRating(value);
                          setErrors((prev) => ({ ...prev, rating: undefined }));
                        }}
                        className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
                      >
                        <Star
                          className={`size-7 transition-colors ${
                            value <= shown
                              ? "fill-brand text-brand"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                    {shown > 0 && (
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {LABELS[shown]}
                      </span>
                    )}
                  </div>
                  <FieldError errors={[errors.rating ? { message: errors.rating } : undefined]} />
                </Field>

                <Field data-invalid={Boolean(errors.comment)}>
                  <FieldLabel htmlFor="comment">Your review</FieldLabel>
                  <Textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(event) => {
                      setComment(event.target.value);
                      setErrors((prev) => ({ ...prev, comment: undefined }));
                    }}
                    placeholder="What went well? Was the technician on time?"
                    aria-invalid={Boolean(errors.comment)}
                  />
                  <FieldDescription>
                    {comment.trim().length}/1000 characters
                  </FieldDescription>
                  <FieldError
                    errors={[errors.comment ? { message: errors.comment } : undefined]}
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {isPending ? "Submitting..." : "Submit review"}
                </Button>

                <FieldDescription className="text-center text-xs">
                  Reviews are public and cannot be edited once submitted.
                </FieldDescription>
              </FieldGroup>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
