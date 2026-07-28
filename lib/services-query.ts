export const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "created_at:asc", label: "Oldest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "title:asc", label: "Title: A to Z" },
  { value: "title:desc", label: "Title: Z to A" },
];

export const DEFAULT_SORT = "created_at:desc";

export type ServiceQuery = {
  searchTerm: string;
  category_id: string;
  technician_id: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: string;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const positiveNumber = (value: string) =>
  value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
    ? String(Number(value))
    : "";

export const parseServiceQuery = (
  params: Record<string, string | string[] | undefined>,
): ServiceQuery => {
  const sortBy = first(params.sortBy);
  const sortOrder = first(params.sortOrder);

  return {
    searchTerm: first(params.searchTerm),
    category_id: first(params.category_id),
    technician_id: first(params.technician_id),
    minPrice: positiveNumber(first(params.minPrice)),
    maxPrice: positiveNumber(first(params.maxPrice)),
    sortBy: ["price", "title", "created_at"].includes(sortBy)
      ? sortBy
      : "created_at",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
};

export const toSearchString = (query: ServiceQuery) => {
  const params = new URLSearchParams();

  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  if (query.category_id) params.set("category_id", query.category_id);
  if (query.technician_id) params.set("technician_id", query.technician_id);
  if (query.minPrice) params.set("minPrice", query.minPrice);
  if (query.maxPrice) params.set("maxPrice", query.maxPrice);
  if (`${query.sortBy}:${query.sortOrder}` !== DEFAULT_SORT) {
    params.set("sortBy", query.sortBy);
    params.set("sortOrder", query.sortOrder);
  }

  return params.toString();
};

export const activeFilterCount = (query: ServiceQuery) =>
  [
    query.searchTerm,
    query.category_id,
    query.technician_id,
    query.minPrice,
    query.maxPrice,
  ].filter(Boolean).length;
