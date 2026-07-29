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
  _count: { booking: number };
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

export type BookingTechnician = {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  experience_year: number | null;
  hourly_rate: string | null;
  user: Pick<User, "id" | "name" | "email" | "phone_no">;
};

export type BookingService = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: Pick<Category, "id" | "name">;
};

export type BookingListItem = Booking & {
  service: BookingService;
  technician: BookingTechnician;
  payment: {
    id: string;
    status: PaymentStatus;
    amount: string;
    paid_at: string | null;
  } | null;
  review: { id: string; rating: number }[];
};

export type BookingDetail = Booking & {
  user: Pick<User, "id" | "name" | "email" | "phone_no">;
  service: BookingService;
  technician: BookingTechnician;
  payment: {
    id: string;
    booking_id: string;
    transaction_id: string;
    amount: string;
    method: string;
    status: PaymentStatus;
    paid_at: string | null;
    created_at: string;
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  }[];
};

export type TechnicianJob = Booking & {
  user: Pick<User, "id" | "name" | "email" | "phone_no">;
  service: BookingService;
  payment: {
    id: string;
    status: PaymentStatus;
    amount: string;
    paid_at: string | null;
  } | null;
  review: { id: string; rating: number }[];
};

export type TechnicianAction = "accept" | "decline" | "in_progress" | "complete";

export type TechnicianProfileDetail = {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  experience_year: number | null;
  hourly_rate: string | null;
  createdAt: string;
  updatedAt: string;
  availability: Availability[];
};

export type CurrentUser = User & {
  technician_profile?: TechnicianProfileDetail | null;
};

export type TechnicianServiceItem = {
  id: string;
  technician_id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  created_at: string;
  category: Pick<Category, "id" | "name">;
  review: { rating: number }[];
};

export type TechnicianListItem = {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  experience_year: number | null;
  hourly_rate: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "name" | "email" | "phone_no" | "role" | "status">;
  review: { rating: number }[];
  service: {
    id: string;
    title: string;
    price: string;
    category: Pick<Category, "id" | "name">;
  }[];
};

export type TechnicianReview = {
  id: string;
  booking_id: string;
  customer_id: string;
  service_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: Pick<User, "id" | "name" | "email">;
};

export type TechnicianDetail = {
  id: string;
  user_id: string;
  bio: string | null;
  skills: string[];
  experience_year: number | null;
  hourly_rate: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "name" | "email" | "phone_no" | "role" | "status">;
  review: TechnicianReview[];
  availability: Availability[];
  service: TechnicianServiceItem[];
};

export type PaymentListItem = {
  id: string;
  booking_id: string;
  transaction_id: string;
  amount: string;
  method: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  booking: {
    id: string;
    scheduled_at: string;
    status: BookingStatus;
    address: string;
    service: {
      id: string;
      title: string;
      price: string;
      category: Pick<Category, "id" | "name">;
    };
    technician: {
      id: string;
      user: Pick<User, "id" | "name">;
    };
  };
};

export type AdminUserDetail = User & {
  technician_profile: {
    id: string;
    bio: string | null;
    skills: string[];
    experience_year: number | null;
    hourly_rate: string | null;
    createdAt: string;
    availability: Availability[];
    service: {
      id: string;
      title: string;
      price: string;
      category: Pick<Category, "id" | "name">;
    }[];
    review: { rating: number }[];
    booking: { id: string; status: BookingStatus }[];
  } | null;
  booking: {
    id: string;
    scheduled_at: string;
    status: BookingStatus;
    address: string;
    created_at: string;
    service: {
      id: string;
      title: string;
      price: string;
      category: Pick<Category, "id" | "name">;
    };
    technician: { id: string; user: Pick<User, "id" | "name"> };
    payment: {
      status: PaymentStatus;
      amount: string;
      paid_at: string | null;
    } | null;
  }[];
  review: { id: string; rating: number }[];
};

export type AdminBookingListItem = Booking & {
  user: Pick<User, "id" | "name" | "email" | "phone_no">;
  technician: {
    id: string;
    user_id: string;
    experience_year: number | null;
    hourly_rate: string | null;
    user: Pick<User, "id" | "name" | "email" | "phone_no">;
  };
  service: {
    id: string;
    title: string;
    description: string;
    price: string;
    category: Pick<Category, "id" | "name">;
  };
  payment: {
    id: string;
    status: PaymentStatus;
    amount: string;
    method: string;
    paid_at: string | null;
  } | null;
  review: { id: string; rating: number }[];
};

export type AdminBookingDetail = Booking & {
  user: Pick<
    User,
    "id" | "name" | "email" | "phone_no" | "role" | "status" | "createdAt"
  >;
  technician: {
    id: string;
    user_id: string;
    bio: string | null;
    skills: string[];
    experience_year: number | null;
    hourly_rate: string | null;
    user: Pick<User, "id" | "name" | "email" | "phone_no" | "status">;
  };
  service: {
    id: string;
    title: string;
    description: string;
    price: string;
    created_at: string;
    category: Category;
  };
  payment: {
    id: string;
    booking_id: string;
    transaction_id: string;
    amount: string;
    method: string;
    status: PaymentStatus;
    paid_at: string | null;
    created_at: string;
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  }[];
};

export type AdminCategory = Category & {
  _count: { service: number };
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
