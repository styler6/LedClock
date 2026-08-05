import type { Equipment, EquipmentBooking } from "@handwerker/shared-types";
import type { EquipmentBookingInput } from "@handwerker/domain";
import type { HandwerkerSupabaseClient } from "./client-factory";

export async function getEquipmentCatalog(client: HandwerkerSupabaseClient): Promise<Equipment[]> {
  const { data, error } = await client.from("equipment").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getEquipmentById(client: HandwerkerSupabaseClient, id: string): Promise<Equipment | null> {
  const { data, error } = await client.from("equipment").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllEquipmentBookings(client: HandwerkerSupabaseClient): Promise<EquipmentBooking[]> {
  const { data, error } = await client.from("equipment_bookings").select("*").order("start_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEquipmentBookingsForProject(client: HandwerkerSupabaseClient, projectId: string): Promise<EquipmentBooking[]> {
  const { data, error } = await client.from("equipment_bookings").select("*").eq("project_id", projectId);
  if (error) throw error;
  return data;
}

export async function getEquipmentBookings(client: HandwerkerSupabaseClient, equipmentId: string): Promise<EquipmentBooking[]> {
  const { data, error } = await client
    .from("equipment_bookings")
    .select("*")
    .eq("equipment_id", equipmentId)
    .order("start_at");
  if (error) throw error;
  return data;
}

/** Equipment currently checked out to a given employee, for the mobile "bei mir" view. */
export async function getBookingsAssignedTo(client: HandwerkerSupabaseClient, profileId: string): Promise<EquipmentBooking[]> {
  const { data, error } = await client
    .from("equipment_bookings")
    .select("*")
    .eq("assigned_to", profileId)
    .in("status", ["reserved", "checked_out"]);
  if (error) throw error;
  return data;
}

export async function createEquipmentBooking(
  client: HandwerkerSupabaseClient,
  companyId: string,
  createdBy: string,
  input: EquipmentBookingInput,
): Promise<EquipmentBooking> {
  const { data, error } = await client
    .from("equipment_bookings")
    .insert({
      company_id: companyId,
      equipment_id: input.equipmentId,
      booking_type: input.bookingType,
      customer_id: input.customerId ?? null,
      project_id: input.projectId ?? null,
      assigned_to: input.assignedTo ?? null,
      start_at: input.startAt,
      end_at: input.endAt,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Marks a reserved booking as checked out to the field (mobile "Gerät ausgeben" action). */
export async function checkOutEquipment(
  client: HandwerkerSupabaseClient,
  bookingId: string,
  conditionOutNotes?: string,
): Promise<EquipmentBooking> {
  const { data, error } = await client
    .from("equipment_bookings")
    .update({ status: "checked_out", condition_out_notes: conditionOutNotes ?? null })
    .eq("id", bookingId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Marks a booking returned and stamps `actual_return_at` for rental/return tracking. */
export async function checkInEquipment(
  client: HandwerkerSupabaseClient,
  bookingId: string,
  conditionInNotes?: string,
): Promise<EquipmentBooking> {
  const { data, error } = await client
    .from("equipment_bookings")
    .update({
      status: "returned",
      actual_return_at: new Date().toISOString(),
      condition_in_notes: conditionInNotes ?? null,
    })
    .eq("id", bookingId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
