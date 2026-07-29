"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import type { ActiveStatus } from "@/lib/types";

export type StatusResult = { ok: true } | { ok: false; message: string };

export const updateUserStatusAction = async (
  userId: string,
  status: ActiveStatus,
): Promise<StatusResult> => {
  const viewer = await getCurrentUser();

  if (!viewer) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (viewer.role !== "admin") {
    return { ok: false, message: "Only admins can change account status." };
  }

  if (viewer.id === userId) {
    return { ok: false, message: "You cannot change your own account status." };
  }

  if (status !== "ban" && status !== "unban") {
    return { ok: false, message: "That status is not allowed." };
  }

  try {
    await apiRequest(`/api/admin/users/${userId}`, {
      method: "PATCH",
      token: await getSessionToken(),
      body: { status },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not update the account. Try again." };
  }
};
