import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

// Profile now lives at the root of each role's namespace
// (/dashboard/customer, /dashboard/technician, /dashboard/admin).
// Kept so older links and bookmarks still land in the right place.
const LegacyProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  redirect(`/dashboard/${user.role}`);
};

export default LegacyProfilePage;
