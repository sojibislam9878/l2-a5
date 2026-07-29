import { redirect } from "next/navigation";

const AdminDashboardPage = () => {
  redirect("/dashboard/admin/users");
};

export default AdminDashboardPage;
