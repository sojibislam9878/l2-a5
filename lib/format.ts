import type { Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatPrice = (value: string | number | null | undefined) => {
  const amount = typeof value === "string" ? Number(value) : value;

  return amount === null || amount === undefined || Number.isNaN(amount)
    ? null
    : currency.format(amount);
};

export const averageRating = (reviews: { rating: number }[]) =>
  reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    : null;

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
