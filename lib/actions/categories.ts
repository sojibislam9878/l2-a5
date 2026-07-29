"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { categorySchema } from "@/lib/validations/category";

export type CategoryResult = { ok: true } | { ok: false; message: string };

const revalidate = () => {
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/services");
  revalidatePath("/");
};

const guard = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return "Your session expired. Please sign in again.";
  }

  if (user.role !== "admin") {
    return "Only admins can manage categories.";
  }

  return null;
};

const friendly = (error: unknown) => {
  if (error instanceof ApiError) {
    // The delete guard also returns 409, but with its own explanatory message,
    // so only rewrite the bare duplicate-name case from Prisma P2002.
    return error.status === 409 &&
      error.message.startsWith("Duplicate value")
      ? "A category with that name already exists."
      : error.message;
  }

  return "Something went wrong. Please try again.";
};

export const createCategoryAction = async (
  values: unknown,
): Promise<CategoryResult> => {
  const denied = await guard();

  if (denied) {
    return { ok: false, message: denied };
  }

  const parsed = categorySchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    await apiRequest("/api/admin/categories", {
      method: "POST",
      token: await getSessionToken(),
      body: parsed.data,
    });

    revalidate();

    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
};

export const deleteCategoryAction = async (
  categoryId: string,
): Promise<CategoryResult> => {
  const denied = await guard();

  if (denied) {
    return { ok: false, message: denied };
  }

  try {
    await apiRequest(`/api/admin/categories/${categoryId}`, {
      method: "DELETE",
      token: await getSessionToken(),
    });

    revalidate();

    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
};

export const updateCategoryAction = async (
  categoryId: string,
  values: unknown,
): Promise<CategoryResult> => {
  const denied = await guard();

  if (denied) {
    return { ok: false, message: denied };
  }

  const parsed = categorySchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    await apiRequest(`/api/admin/categories/${categoryId}`, {
      method: "PATCH",
      token: await getSessionToken(),
      body: parsed.data,
    });

    revalidate();

    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
};
