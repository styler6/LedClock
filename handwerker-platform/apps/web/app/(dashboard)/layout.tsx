import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@handwerker/api-client";
import { signOutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/customers", label: "Kunden" },
  { href: "/quotes", label: "Angebote" },
  { href: "/invoices", label: "Rechnungen" },
  { href: "/projects", label: "Projekte" },
  { href: "/equipment", label: "Geräte" },
];

const ADMIN_NAV_ITEMS = [
  { href: "/admin/employees", label: "Mitarbeiter" },
  { href: "/admin/roles", label: "Rollen" },
  { href: "/admin/company", label: "Firma" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  const isAdmin = profile?.role === "owner" || profile?.role === "admin";

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold">Handwerker-Plattform</p>
          {profile ? <p className="text-xs text-gray-500">{profile.full_name ?? profile.email}</p> : null}
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase text-gray-400">Verwaltung</p>
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : null}
        </nav>
        <form action={signOutAction} className="mt-6 px-2">
          <button type="submit" className="text-sm text-gray-500 underline">
            Abmelden
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
