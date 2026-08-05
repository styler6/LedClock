import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Anmelden</h1>
          <p className="text-sm text-gray-500">Handwerker-Plattform</p>
        </div>
        <AuthForm action={signIn} submitLabel="Anmelden">
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </AuthForm>
        <p className="text-sm text-gray-500">
          Noch keine Firma registriert?{" "}
          <Link className="font-medium text-gray-900 underline" href="/register">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
