# JaPerPo

Wo die Melancholie des portugiesischen Fado auf die Poesie Persiens und die zeitlose Eleganz Japans
trifft. Ein kreativer Raum für die Entdeckung dreier faszinierender Welten in Sprache, Kultur und
Ästhetik.

> Exklusiv für **Luca**, **Darian** und **Tobi**.

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

## Aktueller Stand

Dieses Repository enthält das **App-Gerüst** (Routing, Layout, Theme, LocalStorage-Persistenz,
Login per Profil-Auswahl, alle Screens als „In Arbeit"-Stubs). **Vokabel-Inhalte und
KI-Anbindung folgen später.**

## Tech-Stack

- React 18 + TypeScript + Vite 5
- Tailwind CSS 3 (Class-basiertes Dark Mode, CSS-Variablen für sprachspezifische Akzente)
- React Router v6 (`BrowserRouter` mit `basename` für GitHub Pages)
- LocalStorage hinter async Repository-Interfaces — Supabase ist später drop-in austauschbar
- ESLint Flat Config + Prettier
- GitHub Actions → Deploy auf `gh-pages` Branch

## Quickstart

Voraussetzung: **Node 20** (siehe `.nvmrc`).

```bash
npm ci
npm run dev       # http://localhost:5173/JaPerPo/
npm run typecheck
npm run lint
npm run build     # Output: dist/
npm run preview   # lokaler Vorschau-Server fuer den Build
```

Profile (Luca / Darian / Tobi) werden beim ersten Start automatisch in LocalStorage angelegt
(`japerpo:*`-Keys).

## Deployment (GitHub Pages)

1. Repository nach GitHub pushen (Branch `main`).
2. In den Repo-Einstellungen unter **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **`gh-pages` / `(root)`**
3. Push auf `main` triggert den Workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).
   Er baut die App, kopiert `index.html` zu `404.html` (SPA-Fallback) und veröffentlicht den
   `dist/`-Ordner auf den `gh-pages`-Branch.
4. Die App ist anschließend unter `https://<github-user>.github.io/JaPerPo/` erreichbar.

## Projektstruktur (Auszug)

```
src/
├── pages/           # Screens (Login, Dashboard, Profile, Settings, language/*)
├── layouts/         # AppShell, AuthLayout, LanguageLayout, Header, *Nav
├── components/      # UI, auth, theme, dashboard, feedback
├── providers/       # Auth, Theme, I18n, Storage
├── hooks/           # useAuth, useTheme, useI18n, useCurrentLanguage, ...
├── lib/
│   ├── storage/     # LocalStorage-Driver + Repositories (Supabase-ready)
│   ├── i18n/        # de.ts (aktiv), en.ts (Stub)
│   ├── ai/          # AIProvider-Interface (Implementation folgt)
│   └── utils/       # cn, date, id
├── languages/       # Sprach-Konfiguration (ja, fa, pt)
├── types/           # Datenmodell aus Architekturdesign.md
├── theme/           # Tokens & Sprach-Akzente
└── styles/index.css # Tailwind + CSS-Variablen
```

## Was als Nächstes ansteht

- KI-Provider entscheiden (OpenAI / Anthropic / Gemini / Open-Source) → `src/lib/ai/<provider>.ts`
- Supabase-Anbindung als zweite Repository-Implementation
- Erste Vokabel-Generierung & SRS-Algorithmus
- PWA-Aktivierung (`vite-plugin-pwa`)
