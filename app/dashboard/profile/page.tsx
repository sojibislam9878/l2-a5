import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

const LegacyProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  redirect(`/dashboard/${user.role}`);
};

export default LegacyProfilePage;
