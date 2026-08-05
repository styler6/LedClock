# Deployment: Website auf dem Mac Mini per Docker

Diese Anleitung führst du **auf dem Mac Mini** aus (z. B. über deine
TeamViewer-Sitzung). Die Website läuft danach als Docker-Container und ist im
lokalen Netzwerk erreichbar.

> **Backend-Hinweis:** Die Website braucht ein Supabase-Backend (Datenbank,
> Login, Datei-Speicher). Der Container enthält **nur die Website**, nicht die
> Datenbank. Empfohlen: ein kostenloses Projekt bei **Supabase Cloud**
> (Abschnitt 1). Alternativ lässt sich Supabase auch komplett selbst auf dem
> Mac Mini hosten – sag Bescheid, dann ergänze ich das passende Compose-Setup.

---

## 0. Voraussetzungen auf dem Mac Mini (einmalig)

1. **Docker Desktop für Mac** installieren: https://www.docker.com/products/docker-desktop/
   (Apple-Silicon- oder Intel-Variante je nach Mac). Nach der Installation
   Docker Desktop starten und laufen lassen.
2. **Git** installieren (falls nicht vorhanden): im Terminal `git --version`
   ausführen – macOS bietet dann die Installation der Command-Line-Tools an.

Terminal öffnen: `Programme → Dienstprogramme → Terminal`.

---

## 1. Supabase-Backend anlegen (Supabase Cloud, empfohlen)

1. Auf https://supabase.com einloggen und ein neues Projekt anlegen
   (Region z. B. Frankfurt, ein DB-Passwort vergeben).
2. **Datenbankschema einspielen:** die Migrationen aus `supabase/migrations/`
   in der Reihenfolge ihrer Dateinamen in den **SQL Editor** des Projekts
   kopieren und ausführen (oder mit installierter Supabase-CLI:
   `supabase link --project-ref <ref>` und `supabase db push`).
   Optional die Demodaten aus `supabase/seed.sql` einspielen.
3. Unter **Project Settings → API** diese drei Werte kopieren:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** Key → `SUPABASE_SERVICE_ROLE_KEY`
     (wird serverseitig für die PDF-Erzeugung gebraucht; **nie** öffentlich teilen)

---

## 2. Projekt auf den Mac Mini holen

```bash
git clone https://github.com/styler6/LedClock.git
cd LedClock/handwerker-platform
git checkout claude/handwerker-rental-platform-651583
```

## 3. Umgebungsvariablen setzen

```bash
cp .env.example .env
open -e .env          # öffnet .env im TextEdit
```

In `.env` die drei Supabase-Werte aus Schritt 1 eintragen, Datei speichern:

```
NEXT_PUBLIC_SUPABASE_URL=https://<dein-projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...   # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...        # service_role
```

## 4. Container bauen und starten

```bash
docker compose up -d --build
```

Der erste Build lädt die Basis-Images und dauert einige Minuten. Danach läuft
die Website als Hintergrund-Dienst und startet nach einem Neustart des Mac Mini
automatisch neu (`restart: unless-stopped`).

## 5. Website öffnen

- Auf dem Mac Mini selbst: **http://localhost:3000**
- Von einem anderen Gerät im gleichen Netzwerk: **http://\<IP-des-Mac-Mini\>:3000**
  (IP ermitteln: `ipconfig getifaddr en0`)

---

## Betrieb

| Aufgabe | Befehl (im Ordner `handwerker-platform`) |
|---|---|
| Status ansehen | `docker compose ps` |
| Logs live ansehen | `docker compose logs -f web` |
| Stoppen | `docker compose down` |
| Neu starten | `docker compose restart web` |
| Auf neue Version aktualisieren | `git pull` &nbsp;→&nbsp; `docker compose up -d --build` |

## Hinweise

- **Port ändern:** In `docker-compose.yml` unter `ports` das linke `3000` auf
  einen anderen Wert setzen (z. B. `"8080:3000"`), dann `docker compose up -d`.
- **Von außen erreichbar machen** (Internet statt nur LAN): nicht direkt Port
  3000 ins Netz öffnen. Stattdessen einen Reverse-Proxy mit HTTPS (Caddy, Nginx
  Proxy Manager oder ein Cloudflare Tunnel) davorschalten.
- **Nur Website neu bauen ohne Cache:** `docker compose build --no-cache web`.
