import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Register as a customer to book home services, or as a technician to start receiving job requests.",
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
