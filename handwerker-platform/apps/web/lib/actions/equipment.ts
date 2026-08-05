"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkInEquipment, checkOutEquipment, createEquipmentBooking, getCurrentProfile } from "@handwerker/api-client";
import { equipmentBookingInputSchema } from "@handwerker/domain";

export async function createEquipmentAction(formData: FormData): Promise<void> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) throw new Error("Nicht angemeldet.");

  const name = String(formData.get("name") ?? "");
  if (!name) throw new Error("Name ist erforderlich.");

  const { error } = await supabase.from("equipment").insert({
    company_id: profile.company_id,
    name,
    category: String(formData.get("category") ?? "") || null,
    daily_rental_price: formData.get("dailyRentalPrice") ? Number(formData.get("dailyRentalPrice")) : null,
    is_rentable_to_customers: formData.get("isRentableToCustomers") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/equipment");
}

export async function createBookingAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) return { error: "Nicht angemeldet." };

  const parsed = equipmentBookingInputSchema.safeParse({
    equipmentId: formData.get("equipmentId"),
    bookingType: formData.get("bookingType"),
    customerId: formData.get("customerId") || undefined,
    projectId: formData.get("projectId") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await createEquipmentBooking(supabase, profile.company_id, profile.id, parsed.data);
  revalidatePath("/equipment/bookings");
  revalidatePath(`/equipment/${parsed.data.equipmentId}`);
  return {};
}

export async function checkOutEquipmentAction(bookingId: string, notes?: string): Promise<{ error?: string }> {
  await checkOutEquipment(createServerSupabaseClient(), bookingId, notes);
  revalidatePath("/equipment/bookings");
  return {};
}

export async function checkInEquipmentAction(bookingId: string, notes?: string): Promise<{ error?: string }> {
  await checkInEquipment(createServerSupabaseClient(), bookingId, notes);
  revalidatePath("/equipment/bookings");
  return {};
}
