import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany, getCurrentProfile } from "@handwerker/api-client";
import { updateCompanyAction } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export default async function CompanySettingsPage() {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  const company = profile ? await getCompany(supabase, profile.company_id) : null;

  if (!company) return null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Firmeneinstellungen</h1>
      <form action={updateCompanyAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="name">
            Firmenname
          </label>
          <input id="name" name="name" defaultValue={company.name} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="legalName">
            Rechtlicher Name
          </label>
          <input id="legalName" name="legalName" defaultValue={company.legal_name ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="addressStreet">
            Straße
          </label>
          <input id="addressStreet" name="addressStreet" defaultValue={company.address_street ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="addressZip">
              PLZ
            </label>
            <input id="addressZip" name="addressZip" defaultValue={company.address_zip ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="addressCity">
              Ort
            </label>
            <input id="addressCity" name="addressCity" defaultValue={company.address_city ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="taxId">
              Steuernummer
            </label>
            <input id="taxId" name="taxId" defaultValue={company.tax_id ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="vatId">
              USt-IdNr.
            </label>
            <input id="vatId" name="vatId" defaultValue={company.vat_id ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="iban">
              IBAN
            </label>
            <input id="iban" name="iban" defaultValue={company.iban ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="bic">
              BIC
            </label>
            <input id="bic" name="bic" defaultValue={company.bic ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="quoteNumberPrefix">
              Angebots-Präfix
            </label>
            <input id="quoteNumberPrefix" name="quoteNumberPrefix" defaultValue={company.quote_number_prefix} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="invoiceNumberPrefix">
              Rechnungs-Präfix
            </label>
            <input id="invoiceNumberPrefix" name="invoiceNumberPrefix" defaultValue={company.invoice_number_prefix} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <SubmitButton>Speichern</SubmitButton>
      </form>
    </div>
  );
}
