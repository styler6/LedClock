import type { Company } from "@handwerker/shared-types";
import type { HandwerkerSupabaseClient } from "./client-factory";

export async function getCompany(client: HandwerkerSupabaseClient, id: string): Promise<Company | null> {
  const { data, error } = await client.from("companies").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCompany(
  client: HandwerkerSupabaseClient,
  id: string,
  input: Partial<
    Pick<
      Company,
      | "name"
      | "legal_name"
      | "address_street"
      | "address_zip"
      | "address_city"
      | "tax_id"
      | "vat_id"
      | "iban"
      | "bic"
      | "default_tax_rate"
      | "quote_number_prefix"
      | "invoice_number_prefix"
    >
  >,
): Promise<Company> {
  const { data, error } = await client.from("companies").update(input).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}
