"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { serviceSchema } from "@/lib/validations/service";
import type { Service } from "@/lib/types";

export type ServiceResult =
  | { ok: true; serviceId: string }
  | { ok: false; message: string };

const revalidate = (serviceId?: string) => {
  revalidatePath("/dashboard/services");
  revalidatePath("/services");
  revalidatePath("/");

  if (serviceId) {
    revalidatePath(`/services/${serviceId}`);
  }
};

const guard = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return "Your session expired. Please sign in again.";
  }

  if (user.role !== "technician") {
    return "Only technicians can manage services.";
  }

  return null;
};

export const createServiceAction = async (
  values: unknown,
): Promise<ServiceResult> => {
  const denied = await guard();

  if (denied) {
    return { ok: false, message: denied };
  }

  const parsed = serviceSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    const service = await apiRequest<Service>("/api/services", {
      method: "POST",
      token: await getSessionToken(),
      body: {
        category_id: parsed.data.category_id,
        title: parsed.data.title,
        description: parsed.data.description,
        price: Number(parsed.data.price),
      },
    });

    revalidate();

    return { ok: true, serviceId: service?.id ?? "" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not create the service. Try again." };
  }
};

export const updateServiceAction = async (
  serviceId: string,
  values: unknown,
): Promise<ServiceResult> => {
  const denied = await guard();

  if (denied) {
    return { ok: false, message: denied };
  }

  const parsed = serviceSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    await apiRequest<Service>(`/api/services/${serviceId}`, {
      method: "PATCH",
      token: await getSessionToken(),
      body: {
        category_id: parsed.data.category_id,
        title: parsed.data.title,
        description: parsed.data.description,
        price: Number(parsed.data.price),
      },
    });

    revalidate(serviceId);

    return { ok: true, serviceId };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not update the service. Try again." };
  }
};
