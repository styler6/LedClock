# Handwerker-Plattform

Business-Plattform für Handwerksbetriebe (wie tooltime.software): Kostenvoranschläge, Rechnungen,
Projektplanung und Geräte-Vermietung — als Web-App, Mobile-App und Cloud-Backend.

Dieses Verzeichnis ist ein eigenständiges Monorepo, komplett getrennt vom WLED-Firmware-Code im Rest
dieses Repositories. Alle Befehle unten werden mit `handwerker-platform/` als Arbeitsverzeichnis ausgeführt.

## Stack

- **Web**: Next.js 14 (App Router), Tailwind CSS
- **Mobile**: Expo / React Native (expo-router)
- **Backend**: Supabase (Postgres, Auth, Storage, Row Level Security)
- **Monorepo**: pnpm workspaces + Turborepo

## Struktur

```
apps/web/            Next.js Web-App
apps/mobile/          Expo Mobile-App
packages/shared-types/ Generierte Supabase-DB-Types + Enums
packages/domain/       Reine Business-Logik (Preisberechnung, Nummerierung, Verfügbarkeit, Validierung)
packages/api-client/   Geteilte Datenzugriffsschicht (von Web & Mobile genutzt)
packages/pdf/          PDF-Templates für Angebote/Rechnungen (@react-pdf/renderer)
packages/ui/           Geteilte UI-Bausteine (Status-Badges) für die Web-App
packages/config/       Geteilte ESLint-/TypeScript-Konfiguration
supabase/              Migrationen, Seed-Daten, lokale Supabase-Konfiguration
```

## Setup

Voraussetzungen: Node.js 20+, pnpm, Docker (für lokales Supabase), [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
pnpm install
cp .env.example .env               # und mit den Werten aus `supabase start` befüllen
pnpm db:start                      # startet lokales Supabase (Postgres, Auth, Storage, Studio)
pnpm db:reset                      # wendet alle Migrationen + seed.sql an
pnpm db:gen-types                  # generiert packages/shared-types/src/database.types.ts aus dem Live-Schema
```

`pnpm db:start` gibt eine `anon key` und `service_role key` aus — diese in `.env` unter
`NEXT_PUBLIC_SUPABASE_ANON_KEY` bzw. `SUPABASE_SERVICE_ROLE_KEY` eintragen.

### Web-App starten

```bash
pnpm --filter @handwerker/web dev
```

Öffnet unter `http://localhost:3000`. Mit den Seed-Daten (`supabase/seed.sql`) einloggen:
`owner@mustermann-handwerk.de` / `password123` (oder `anna@mustermann-handwerk.de` als Mitarbeiterin).

### Mobile-App starten

```bash
cp .env apps/mobile/.env           # Expo liest .env aus dem App-Verzeichnis, nicht vom Monorepo-Root
pnpm --filter @handwerker/mobile start
```

Mit Expo Go auf einem Gerät im selben Netzwerk öffnen. `EXPO_PUBLIC_SUPABASE_URL` muss dabei auf die
LAN-IP dieses Rechners zeigen (nicht `localhost`), da Expo Go auf einem separaten Gerät/Emulator läuft.

## Entwicklung

```bash
pnpm build       # Turborepo-Build aller Apps/Packages
pnpm typecheck    # TypeScript-Check aller Apps/Packages
pnpm test         # Vitest-Unit-Tests (aktuell: packages/domain)
pnpm lint         # ESLint
```

### Datenbank-Regressions-Test (RLS + Kernlogik)

`supabase/tests/rls_and_logic_test.sql` prüft gegen eine frisch geseedete DB die
Mandanten-Isolation, den Rollen-Schutz, die Dokumentennummerierung und den
Geräte-Überlappungs-Constraint — indem es (wie PostgREST) verschiedene Nutzer per
`request.jwt.claims` impersoniert:

```bash
pnpm db:reset
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" \
  -f supabase/tests/rls_and_logic_test.sql
```

Erwartet: alle Zählwerte wie kommentiert und am Ende `ALLE TESTS DURCHLAUFEN.`

## Architektur-Hinweise

- **Multi-Tenancy**: Jede Handwerksfirma ist ein Tenant (`companies`-Tabelle), durchgesetzt per
  Row Level Security auf allen Tabellen (`supabase/migrations/20260101000600_rls_policies.sql`).
- **Rollen**: `owner` / `admin` / `employee`, siehe RLS-Policies und `set_employee_role()`-RPC
  (Rollenänderungen sind nur über diese abgesicherte Funktion möglich, nie per direktem Update).
- **Dokumentennummerierung**: Angebots-/Rechnungsnummern werden atomar über die Postgres-Funktion
  `next_document_number()` vergeben (`supabase/migrations/20260101000300_quotes.sql`).
- **Geräte-Verfügbarkeit**: Überlappende Buchungen werden durch einen `EXCLUDE`-Constraint in Postgres
  verhindert (`supabase/migrations/20260101000500_equipment.sql`) sowie client-seitig gespiegelt in
  `packages/domain/src/availability.ts`.
- **PDF-Erzeugung**: läuft serverseitig in `apps/web/app/api/pdf/{quote,invoice}/[id]/route.ts`,
  Ergebnis wird in Supabase Storage abgelegt und die URL am Dokument gespeichert.

## Was als Nächstes käme

- Barcode-/QR-Scan für schnelleren Geräte-Check-in/out in der Mobile-App (`expo-camera`)
- Granularere Rollen-/Berechtigungsverwaltung über die einfache Owner/Admin/Employee-Einteilung hinaus
- E-Mail-Benachrichtigungen (z. B. überfällige Rechnungen) über eine geplante Supabase Edge Function
- Kundenportal (eigene Rolle `customer`) für Selbstbedienung bei Angeboten/Rechnungen
