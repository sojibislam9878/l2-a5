export type Role = "customer" | "technician" | "admin";

export type ActiveStatus = "unban" | "ban";

export type BookingStatus =
  | "pending"
  | "accept"
  | "decline"
  | "in_progress"
  | "complete";

export type PaymentStatus = "pending" | "completed" | "failed";

export type WeekDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type User = {
  id: string;
  name: string;
  email: string;
  phone_no: string | null;
  role: Role;
  status: ActiveStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errorDetails?: unknown;
};
