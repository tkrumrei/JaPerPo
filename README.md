# JaPerPo

Wo die Melancholie des portugiesischen Fado auf die Poesie Persiens und die zeitlose Eleganz Japans
trifft. Ein kreativer Raum für die Entdeckung dreier faszinierender Welten in Sprache, Kultur und
Ästhetik.

> Exklusiv für **Luca** (Persisch · B1) · **Darian** (Portugiesisch · A1) · **Tobi** (Japanisch · A1).

## Vision

JaPerPo (**Ja**panisch · **Per**sisch · **Po**rtugiesisch) ist eine private Sprachlern-App mit
KI-gestütztem Vokabular, Dialog-Übungen, freiem Chat-Sprachpartner, Lese- & Lückentexten,
Grammatiktraining und einem Fleiss-Leaderboard zwischen den drei Lernenden. Detaillierte
Spezifikationen liegen in den Markdown-Dokumenten dieses Repositories:

- [`Architekturdesign.md`](./Architekturdesign.md) — Tech-Stack & Datenmodell
- [`DesignAnforderungen`](./DesignAnforderungen) — UI/UX-Richtlinien
- [`JapanischAnforderungen.md`](./JapanischAnforderungen.md)
- [`PersischAnforderungen.md`](./PersischAnforderungen.md)
- [`PortugalAnforderungen.md`](./PortugalAnforderungen.md)

## Tech-Stack

- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + React Router v6
- **Backend / DB**: Supabase (PostgreSQL + Realtime + Edge Functions)
- **KI**: Google Gemini, aufgerufen über eine Supabase Edge Function (API-Key bleibt geheim)
- **Persistenz**: Repository-Pattern — Supabase, wenn `VITE_SUPABASE_URL` gesetzt ist; sonst LocalStorage-Fallback für offline Dev
- **Deploy**: GitHub Actions → `gh-pages`-Branch

## Quickstart (lokal)

Voraussetzung: **Node 20** (siehe `.nvmrc`).

```bash
npm ci
cp .env.example .env.local        # Werte eintragen, siehe Abschnitt "Konfiguration"
npm run dev                       # http://localhost:5173/JaPerPo/
```

Ohne `.env.local` startet die App im LocalStorage-Modus — kein Supabase, keine KI.

```bash
npm run typecheck
npm run lint
npm run build     # Output: dist/
npm run preview
```

## Konfiguration

### `.env.local` (lokal, nicht committed)

```ini
VITE_SUPABASE_URL=https://<projekt-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Beide Werte findest du im Supabase-Dashboard unter **Project Settings → API**. Der `anon`-Key ist
designed-to-be-public — er landet ohnehin im JS-Bundle. Den `service_role`-Key niemals hier oder
ins Repo geben.

### GitHub Pages Build

Damit der deployte Stand Supabase nutzt, müssen dieselben zwei Werte auch als **Repository-Secrets**
hinterlegt werden:

**Repo → Settings → Secrets and variables → Actions → New repository secret**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Der Workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) reicht sie an den
Vite-Build durch.

## Supabase einrichten

### 1. Projekt verlinken (einmalig)

```powershell
npm install -g supabase
supabase login
supabase link --project-ref <projekt-ref>      # ref steht in der Supabase-URL
```

### 2. Schema deployen

Die Migration unter [`supabase/migrations/`](./supabase/migrations/) erzeugt alle 11 Tabellen,
seed-et die drei Nutzer und legt RLS-Policies an (anon-Vollzugriff — für eine 3-Personen-Privat-
App ausreichend).

```powershell
supabase db push
```

### 3. Gemini-Key als Edge-Function-Secret hinterlegen

```powershell
supabase secrets set GEMINI_API_KEY=<dein-google-ai-studio-key>
```

Optional: Modell oder Rate-Limit überschreiben

```powershell
supabase secrets set GEMINI_MODEL=gemini-2.0-flash
supabase secrets set RATE_LIMIT_PER_HOUR=100
```

### 4. Edge Function deployen

```powershell
supabase functions deploy ai-generate
```

Die Funktion liegt unter [`supabase/functions/ai-generate/index.ts`](./supabase/functions/ai-generate/index.ts)
und nimmt vom Frontend `{ userId, action, payload }` entgegen. Sie prüft das Rate Limit (Tabelle
`ai_usage`), baut den passenden Prompt, ruft Gemini auf und gibt JSON zurück.

Sichtprüfung im Browser-Devtools-Netzwerk-Tab: ein KI-Aufruf landet als POST auf
`<projekt>.supabase.co/functions/v1/ai-generate`.

## Deployment (GitHub Pages)

1. Push auf `main` triggert den Workflow.
2. Beim ersten erfolgreichen Lauf entsteht der `gh-pages`-Branch.
3. **Settings → Pages**: Source `Deploy from a branch` → Branch `gh-pages` / `(root)`.
4. URL: `https://tkrumrei.github.io/JaPerPo/`.

Bei tieferen Routen (z. B. nach F5 auf `/lang/fa/vocab`) greift `404.html` als SPA-Fallback.

## Sicherheit der „Kein-Login"-Variante

Da es keinen echten Auth-User gibt, kann RLS nicht auf `auth.uid()` basieren. Stattdessen:

- **Privacy by URL** — nur die drei Lernenden kennen die GH-Pages-URL.
- **App-seitige Filter** — jede Query filtert auf `user_id = currentUser.id`.
- **Rate Limit pro `user_id`** in der Edge Function (default 100/h) verhindert Kostenexplosionen
  bei Bugs oder Missbrauch.
- **`service_role`-Key bleibt ausschließlich in Supabase**.

Wenn du strikteren Schutz willst, lässt sich später ein gemeinsames Master-Passwort + custom JWT
einbauen.

## Projektstruktur (Auszug)

```
src/
├── pages/           # Screens (Login, Dashboard, Profile, Settings, language/*)
├── layouts/         # AppShell, AuthLayout, LanguageLayout, Header, *Nav
├── components/      # UI, auth, theme, dashboard, feedback
├── providers/       # Auth, Theme, I18n, Storage
├── hooks/           # useAuth, useTheme, useI18n, useAI, useCurrentLanguage, ...
├── lib/
│   ├── storage/     # Repository-Pattern: LocalStorage + supabase/ (Auto-Switch)
│   ├── supabase/    # Supabase-Client + Database-Typen
│   ├── ai/          # AIProvider-Interface + Gemini-Adapter (ruft Edge Function)
│   ├── i18n/        # de.ts (aktiv), en.ts (Stub)
│   └── utils/       # cn, date, id
├── languages/       # Sprach-Konfiguration (ja, fa, pt)
├── types/           # Datenmodell aus Architekturdesign.md
├── theme/           # Tokens & Sprach-Akzente
└── styles/index.css # Tailwind + CSS-Variablen

supabase/
├── config.toml
├── migrations/      # SQL-Schema (11 Tabellen + ai_usage + RLS + Seed)
└── functions/
    └── ai-generate/ # Edge Function (Gemini-Proxy + Rate Limit)
```

## Was als Nächstes ansteht

- Erste Vokabel-Generierung pro Sprache (Buttons in `VocabularyTrainerPage`)
- SM-2 Spaced-Repetition-Algorithmus
- Dialog-, Chat-, Lese-, Cloze-, Grammar-, Test-Implementierungen mit Edge-Function-Calls
- Realtime Leaderboard + Satz des Tages
- PWA-Aktivierung (`vite-plugin-pwa`)
