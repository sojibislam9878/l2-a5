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

export type Category = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type TechnicianSummary = {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  experience_year: number | null;
  hourly_rate: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "name" | "email">;
};

export type ServiceReview = {
  rating: number;
  comment: string;
  customer_id: string;
};

export type Service = {
  id: string;
  technician_id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  created_at: string;
  category: Category;
  technician: TechnicianSummary & { availability: Availability[] };
  review: ServiceReview[];
};

export type Availability = {
  day: WeekDay;
  start_time: string;
  end_time: string;
};

export type ServiceReviewDetail = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: Pick<User, "id" | "name">;
};

export type ServiceDetail = {
  id: string;
  technician_id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  created_at: string;
  category: Category;
  technician: {
    id: string;
    user_id: string;
    bio: string | null;
    skills: string[];
    experience_year: number | null;
    hourly_rate: string | null;
    createdAt: string;
    updatedAt: string;
    user: Pick<User, "id" | "name" | "email" | "phone_no">;
    availability: Availability[];
  };
  review: ServiceReviewDetail[];
};

export type Booking = {
  id: string;
  customer_id: string;
  technician_id: string;
  service_id: string;
  scheduled_at: string;
  address: string;
  note: string | null;
  status: BookingStatus;
  created_at: string;
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
