"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export const logoutAction = async () => {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/");
};
