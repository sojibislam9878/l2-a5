export const TECHNICIAN_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "hourly_rate:asc", label: "Rate: low to high" },
  { value: "hourly_rate:desc", label: "Rate: high to low" },
  { value: "experience_year:desc", label: "Most experienced" },
  { value: "experience_year:asc", label: "Least experienced" },
  { value: "updatedAt:desc", label: "Recently updated" },
];

export const DEFAULT_TECHNICIAN_SORT = "createdAt:desc";

export type TechnicianQuery = {
  searchTerm: string;
  skills: string;
  minExperience: string;
  maxExperience: string;
  minRate: string;
  maxRate: string;
  sortBy: string;
  sortOrder: string;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const positiveNumber = (value: string) =>
  value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
    ? String(Number(value))
    : "";

export const parseTechnicianQuery = (
  params: Record<string, string | string[] | undefined>,
): TechnicianQuery => {
  const sortBy = first(params.sortBy);
  const sortOrder = first(params.sortOrder);

  return {
    searchTerm: first(params.searchTerm),
    skills: first(params.skills),
    minExperience: positiveNumber(first(params.minExperience)),
    maxExperience: positiveNumber(first(params.maxExperience)),
    minRate: positiveNumber(first(params.minRate)),
    maxRate: positiveNumber(first(params.maxRate)),
    sortBy: ["hourly_rate", "experience_year", "createdAt", "updatedAt"].includes(
      sortBy,
    )
      ? sortBy
      : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
};

export const toTechnicianSearchString = (query: TechnicianQuery) => {
  const params = new URLSearchParams();

  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  if (query.skills) params.set("skills", query.skills);
  if (query.minExperience) params.set("minExperience", query.minExperience);
  if (query.maxExperience) params.set("maxExperience", query.maxExperience);
  if (query.minRate) params.set("minRate", query.minRate);
  if (query.maxRate) params.set("maxRate", query.maxRate);
  if (`${query.sortBy}:${query.sortOrder}` !== DEFAULT_TECHNICIAN_SORT) {
    params.set("sortBy", query.sortBy);
    params.set("sortOrder", query.sortOrder);
  }

  return params.toString();
};

export const technicianFilterCount = (query: TechnicianQuery) =>
  [
    query.searchTerm,
    query.skills,
    query.minExperience,
    query.maxExperience,
    query.minRate,
    query.maxRate,
  ].filter(Boolean).length;
