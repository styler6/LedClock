import Link from "next/link";
import { registerCompany } from "@/lib/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Firma registrieren</h1>
          <p className="text-sm text-gray-500">Legt Ihre Firma und Ihr Owner-Konto an</p>
        </div>
        <AuthForm action={registerCompany} submitLabel="Registrieren">
          <div>
            <label className="block text-sm font-medium" htmlFor="companyName">
              Firmenname
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="fullName">
              Ihr Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </AuthForm>
        <p className="text-sm text-gray-500">
          Bereits registriert?{" "}
          <Link className="font-medium text-gray-900 underline" href="/login">
            Zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
