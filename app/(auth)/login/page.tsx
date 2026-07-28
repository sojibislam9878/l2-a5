import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to manage your FixItNow bookings, services, and payments.",
};

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const [user, params] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (user) {
    redirect("/");
  }

  return <LoginForm redirectTo={params.redirect} />;
};

export default LoginPage;
