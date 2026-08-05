import type { Customer } from "@handwerker/shared-types";
import type { CustomerInput } from "@handwerker/domain";
import type { HandwerkerSupabaseClient } from "./client-factory";

export async function getCustomers(client: HandwerkerSupabaseClient): Promise<Customer[]> {
  const { data, error } = await client.from("customers").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getCustomer(client: HandwerkerSupabaseClient, id: string): Promise<Customer | null> {
  const { data, error } = await client.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCustomer(
  client: HandwerkerSupabaseClient,
  companyId: string,
  input: CustomerInput,
): Promise<Customer> {
  const { data, error } = await client
    .from("customers")
    .insert({
      company_id: companyId,
      type: input.type,
      name: input.name,
      contact_person: input.contactPerson || null,
      email: input.email || null,
      phone: input.phone || null,
      address_street: input.addressStreet || null,
      address_zip: input.addressZip || null,
      address_city: input.addressCity || null,
      notes: input.notes || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(
  client: HandwerkerSupabaseClient,
  id: string,
  input: Partial<CustomerInput>,
): Promise<Customer> {
  const { data, error } = await client
    .from("customers")
    .update({
      ...(input.type !== undefined && { type: input.type }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.contactPerson !== undefined && { contact_person: input.contactPerson || null }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.addressStreet !== undefined && { address_street: input.addressStreet || null }),
      ...(input.addressZip !== undefined && { address_zip: input.addressZip || null }),
      ...(input.addressCity !== undefined && { address_city: input.addressCity || null }),
      ...(input.notes !== undefined && { notes: input.notes || null }),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(client: HandwerkerSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("customers").delete().eq("id", id);
  if (error) throw error;
}
