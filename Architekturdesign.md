# JaPerPo – Architekturdesign

## 1. Tech Stack

### Frontend
- **Framework**: Open Pioneer Trails Framework (P React / P React Native)
- **Styling**: Tailwind CSS
- **State Management**: Pioneer State Management / Context API

### Backend & Datenbank
- **Supabase** (PostgreSQL-basiert)
  - **Auth**: Benutzerregistrierung, Login (Email, OAuth)
  - **Postgres**: Benutzerdaten, Fortschritt, KI-Inhalte, Statistiken, Leaderboards
  - **Realtime**: Live-Updates für Chat-Features, Leaderboards, "Satz des Tages"
  - **Storage**: Audio-Files, evtl. KI-generierte Inhalte

### KI-Integration
- **KI-Provider**: Noch offen (OpenAI, Anthropic, Gemini, Open-Source – wählbar)
- **API-Anbindung**: REST API oder SDK
- **Use Cases**:
  - Automatische Vokabel-Generierung aus Kontext/Wissensstand (Persisch-B1→C2, Japanisch-Alltag, Portugiesisch-Alltag)
  - Konversations-Training (Dialog-basiert und freier Chat)
  - Lesetexte generieren (Persisch)
  - Lückentexte erstellen (Portugiesisch)
  - Grammatik-Erklärungen auf Abruf (Persisch/Portugiesisch)
  - "Satz des Tages" generieren und auswählen lassen
  - Adaptive难度-Analyse
  - Tests/Übungen generieren (Portugiesisch: verschiedene Element-Kombinationen)

---

## 2. Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Open Pioneer)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐  │
│  │  Vokabel  │ │ Dialog-  │ │ Freier   │ │ Lesetext │ │ Tests│  │
│  │ Trainer   │ │ Training │ │ Chat     │ │ & Satzman│ │      │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘  │
│       │             │             │             │           │      │
└───────┼─────────────┼─────────────┼─────────────┼───────────┼──────┘
        │             │             │             │           │
   ┌────┴──────┐ ┌────┴─────┐ ┌────┴────┐ ┌────┴─────┐ ┌────┴────┐
   │ Supabase  │ │ Supabase │ │  AI     │ │  Supabase│ │ Supabase│
   │  (Auth +  │ │  (DB +   │ │ (Vokabel│ │(Storage  │ │(Stats, │
   │  Progress)│ │  Stats)  │ │ /Dialog)│ │  etc.)   │ │ Leader  │
   └───────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘
```

**Kommunikation:**
- Frontend ←→ Supabase: REST + Realtime Subscriptions (Auth, Fortschritt, Stats, KI-Inhalte, Leaderboard)
- Frontend ←→ AI Provider: REST/SDK (Vokabel-Generierung, Konversationen, Tests, Lesetexte)

---

## 3. KI-Integration

### 3.1 Automatische Vokabel-Generierung
- KIGeneriert themenbasierte Vokabellisten automatisch (keine manuelle Erstellung nötig – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Kontext-Sätze und Beispiele werden mitgeneriert
- Basierend auf Wissensstand und Level (z.B. B1→C2 für Persisch, Alltagsniveaus für Japanisch/Portugiesisch)
- Generierte Vokabeln werden in Supabase gespeichert → später abrufbar
- Spaced Repetition State wird pro Wort gespeichert

### 3.2 Dialog-basierte Konversationen
- KI generiert strukturierte Dialoge für Alltagsszenarien (simulierte Unterhaltungen – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Alltagssituationen: Restaurant, Bahnhof, Bäcker, Uni, Nachbarn, Einkaufen, Unterkunft, Höflichkeiten etc.
- Schritt-für-Schritt Übung: KI stellt Satz, Nutzer antwortet (Text oder Multiple-Choice)
- KI gibt hilfreiches Feedback bei Fehlern (siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Fortschritt basiert auf deinem Wissensstand (adaptiv – siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))

### 3.3 Freier Chat-Sprachpartner
- Integriertes Chat-Fenster mit Session-Kontext (siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- KI spielt Konversationspartner auf der Zielsprache
- Natural Language Feedback
- Ideal zum "frei-Üben" nach gelerntem Material

### 3.4 Lesetexte generieren
- KI generiert passende Lesetexte basierend auf Level (Persisch B1→C2 – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Schwierigkeitsgrad passt sich dem Fortschritt an
- Optional: Vokabeln markieren/hervorheben

### 3.5 Lückentexte erstellen
- KI generiert Lückentexte aus Lesetexten oder eigenen Sätzen (Portugiesisch – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Verschiedene Schwierigkeitsgrade

### 3.6 Grammatik-Erklärungen auf Abruf
- Bei Bedarf Erklärungen zu Wörtern (Herkunft, Konjugation etc.) oder Grammatik durch KI (Persisch/Portugiesisch – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Gezieltes Grammatiktraining (Deklinationen, Sonderformen – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))

### 3.7 Tests & Übungen generieren
- KI erstellt Tests mit verschiedenen Elementen (Vokabeln, Lückentexte, Grammatik, Konversation – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Begrenzte Anzahl an Versuchen pro Test → Extra-Punkte (Gamification)

### 3.8 "Satz des Tages"
- Jeden Tag neu generierter Satz (gleicher Satz für alle drei Sprachen – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Vorheriger Leaderboard-Sieger vom Vortag darf den Satz aussuchen
- Live-Benachrichtigung via Supabase Realtime

### 3.9 Adaptive难度-Analyse
- KI analysiert Antwortmuster und Schwachstellen (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))
- Passt Schwierigkeit dynamisch an
- Erkennt Wissenslücken
- Empfiehlt relevante Vokabeln/Themen

---

## 4. Datenmodell

### 4.1 Benutzer (users)
```sql
id UUID (PK, FK → auth.users)
email TEXT
username TEXT
languages TEXT [] (aktive Sprachen: ja, fa, pt)
level TEXT (A1, A2, B1, B2, C1, C2 – pro Sprache individuell)
xp INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 4.2 Benutzer-Profil (profiles)
```sql
id UUID (PK, FK → users)
display_name TEXT
avatar_url TEXT
settings JSONB (Spracheinstellungen, Benachrichtigungen, Lernziel-Tage/Dauer)
pinyin_enabled BOOLEAN (Persisch: lateinische Lautschrift erlauben – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
```

### 4.3 Fortschritt (progress)
```sql
id UUID (PK)
user_id UUID (FK → users)
vocabulary_id UUID (FK → vocabulary_items)
status TEXT ('new', 'learning', 'review', 'mastered')
next_review TIMESTAMP
review_count INTEGER
ease_factor REAL
last_answer_correct BOOLEAN
```

### 4.4 Vokabeln (vocabulary_items)
```sql
id UUID (PK)
language TEXT (ja, fa, pt)
word TEXT
translation TEXT
transcription TEXT (lateinische Lautschrift für Persisch – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
context_sentence TEXT
example_sentence TEXT
difficulty INTEGER
level TEXT (A1, A2, B1, etc.)
ai_generated BOOLEAN
category TEXT (Restaurant, Transport, Bäcker, Uni, etc.)
created_at TIMESTAMP
```

### 4.5 Dialoge (dialogues)
```sql
id UUID (PK)
language TEXT
title TEXT
scenario TEXT (Restaurant, Bahnhof, Bäcker, Uni, Nachbarn, etc.)
conversation JSONB (array von Dialog-Schritten mit Antworten)
ai_generated BOOLEAN
difficulty INTEGER
level TEXT
created_at TIMESTAMP
```

### 4.6 Lesetexte (reading_texts)
```sql
id UUID (PK)
language TEXT
title TEXT
content TEXT
level TEXT (A1-C2)
ai_generated BOOLEAN
word_count INTEGER
created_at TIMESTAMP
```

### 4.7 Lückentexte (cloze_texts)
```sql
id UUID (PK)
language TEXT
title TEXT
content_text TEXT
cloze_positions JSONB (position, answer, hint)
ai_generated BOOLEAN
difficulty INTEGER
created_at TIMESTAMP
```

### 4.8 Tests (tests)
```sql
id UUID (PK)
user_id UUID (FK → users)
language TEXT
title TEXT
type TEXT (multiple_choice, cloze, grammar, conversation, mixed)
questions JSONB
attempts_allowed INTEGER
max_attempts_reached BOOLEAN
extra_points_awarded BOOLEAN
ai_generated BOOLEAN
created_at TIMESTAMP
completed_at TIMESTAMP
```

### 4.9 Satzan des Tages (sentence_of_the_day)
```sql
id UUID (PK)
date DATE (eindeutig pro Tag)
text TEXT (für jede Sprache eine Version)
selected_by_user_id UUID (FK → users, Wer hat den Satz ausgewählt?)
selected_by_username TEXT
words JSONB (wichtige Vokabeln aus dem Satz)
explanation TEXT
created_at TIMESTAMP
```

### 4.10 Statistiken (statistics)
```sql
id UUID (PK)
user_id UUID (FK → users)
streak_days INTEGER
last_study_date DATE
total_words_learned INTEGER
total_conversations_completed INTEGER
total_reading_texts_completed INTEGER
total_tests_completed INTEGER
achievements JSONB (array von Badges)
weekly_progress JSONB
stats_by_language JSONB (getrennte Stats pro Sprache)
```

### 4.11 Leaderboard (leaderboard)
```sql
id UUID (PK)
user_id UUID (FK → users)
rank INTEGER
xp INTEGER
streak_days INTEGER
updated_at TIMESTAMP
```

---

## 5. Lern-Features

### 5.1 Spaced Repetition Vokabeltrainer
- Analog zu Anki – Worte erscheinen in intelligenten Intervallen (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))
- SM-2 Algorithmus oder ähnlich (ease_factor, next_review)
- **Automatische Generierung**: Keine manuelle Vokabel-Erstellung nötig – KI generiert kontinuierlich neue Vokabeln (siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Schreibung in lateinischer Lautschrift optional (Persisch – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Fortschritt wird in Supabase gespeichert

### 5.2 Dialog-basierte Konversationen
- Vordefinierte Alltagsszenarien mit KI-generierten Dialogen ("simulierte Unterhaltungen" – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Alltagssituationen: Restaurant, Bahnhof, Bäcker, Uni, Nachbarn, Einkaufen, Transport, Unterkunft, Höflichkeiten etc.
- Schritt-für-Schritt: KI stellt Satz, Nutzer antwortet (Text oder Multiple-Choice)
- **Hilfreiches Feedback bei Fehlern** (siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Kategorien sprachabhängig:
  - Japanisch: Alltags-Kommunikation für Reisen (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))
  - Persisch: B1→C2 progressive Szenarien (siehe [@PersischAnforderungen](../PersischAnforderungen.md))
  - Portugiesisch: Alltagssituationen Bäcker, Bahn, Uni, Nachbarn etc. (siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))

### 5.3 Freier AI-Sprachpartner-Chat
- Integriertes Chat-Fenster mit Session-Kontext (siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Ungestrukturiertes Chat-Interface
- KI antwortet natürlich auf Zielsprache
- Natural Language Processing für Feedback
- Optional: KI korrigiert Fehler sanft

### 5.4 Lesetexte
- KI-generierte Lesetexte basierend auf Level (Persisch A1→C2 – siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- Progressive Steigerung von Länge und Schwierigkeit

### 5.5 Lückentexte
- KI generiert Lückentexte aus Lesetexten oder eigenen Sätzen (Portugiesisch – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))

### 5.6 Grammatiktraining
- Gezieltes Grammatiktraining (Deklinationen, Konjugation, Sonderformen – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Bei Bedarf Erklärungen zu Wörtern (Herkunft, Konjugation etc. – siehe [@PersischAnforderungen](../PersischAnforderungen.md))

### 5.7 Tests
- Verschiedene Elemente kombinierbar: Vokabeln, Lückentexte, Grammatik, Konversation (siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Begrenzte Anzahl an Versuchen → Extra-Punkte (Gamification – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))

### 5.8 Gamification
- **Exp-System**: XP sammeln durch Lernen (siehe [@PersischAnforderungen](../PersischAnforderungen.md))
- **Streak-Tracker**: Tägliche Lern-Serie (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))
- **Badges / Achievements**: Meilensteine freischalten (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md))
- **Leaderboards**: Vergleich aller Lernenden untereinander (siehe [@PersischAnforderungen](../PersischAnforderungen.md) und [@PortugalAnforderungen](../PortugalAnforderungen.md))
- **Fleiss-Leaderboard**: Speziell für Vergleich aller drei Nutzer (siehe [@PersischAnforderungen](../PersischAnforderungen.md))

### 5.9 "Satz des Tages"
- Jeden Tag neu generierter Satz (gleicher Inhalt für alle drei Sprachen – siehe [@PortugalAnforderungen](../PortugalAnforderungen.md))
- Leaderboard-Gewinner vom Vortag darf Satz auswählen

---

## 6. Sprachen

### 6.1 Unterstützte Sprachen
- 🇯🇵 **Japanisch** – Fokus: gesprochen, Alltagssituationen, Reise-Kommunikation (A1-Basic)
- 🇮🇷 **Persisch** – Fokus: B1→C2 progressives Lernen, umfangreiche Features (Lesetexte, Grammatik, Lautschrift)
- 🇵🇹 **Portugiesisch** – Fokus: gesprochen, Alltagssituationen, Grammatik, Lückentexte (europäisches Portugiesisch)

### 6.2 Benutzer & Community
- **Nur drei Nutzer**: Luca, Darian, Tobi – keine öffentliche Registrierung, keine externen Benutzer
- App wird exklusiv unter den dreien genutzt
- **Leaderboard**: Direkter Vergleich aller drei Nutzer, untereinander angezeigt
- **Fleiss-Leaderboard**: Spezifisch für die drei Nutzer, kein anonymes Ranking
- **Satz des Tages**: Leaderboard-Gewinner (unter den dreien) darf Satz auswählen

### 6.3 Sprachspezifische Besonderheiten

**Japanisch** (siehe [@JapanischAnforderungen](../JapanischAnforderungen.md)):
- Fokus auf **gesprochene Sprache** (Hören & Sprechen)
- Schriftsysteme zur Lesbarkeit anzeigen (Hiragana, Katakana, Kanji), aber nicht aktiv abfragen
- Keine Schreibübungen
- Konversations-Fokus: Alltag in Japan

**Persisch** (siehe [@PersischAnforderungen](../PersischAnforderungen.md)):
- **Lateinische Lautschrift** für persische Wörter (kein persisches Tastatur-Layout nötig)
- Skalierbar von B1 bis C2 (langfristig)
- Keine manuelle Vokabel-Erstellung – alles KI-generiert
- Lesetexte, Grammatik-Erklärungen, Wort-Herkünfte
- KI dient als zentrales Element (Vokabeln, Texte, Chat, Erklärungen)

**Portugiesisch** (siehe [@PortugalAnforderungen](../PortugalAnforderungen.md)):
- Lückentexte als Kernfeature
- "Satz des Tages" (gewählt vom Leaderboard-Gewinner)
- Gezieltes Grammatiktraining (Deklinationen, Sonderformen)
- Tests mit verschiedenen Element-Kombinationen

---

## 7. UI/UX Grundsätze

### 7.1 Design-Richtlinien
- **Moderne, farbige Ästhetik**: Apple-ähnliches Design ("Apple-esque") – clean, elegant, farbenfroh
- **Bright/Dark Mode**: Umschaltbar, automatisches System-Theme-Matching
- **Kleine Animationen**: Subtile Micro-Animationen für Feedback (z.B. Button-Druck, Fortschritt-Updates, Erfolge)
- **Responsive Design**:optimiert für Handy und Laptop/PC gleichzeitig

### 7.2 Login / Startbildschirm
- **Kein Passwort nötig**: Drei Buttons zu den Benutzerkonten: Luca, Darian, Tobi
- Schneller Start ohne Login-Prozedur für MVP
- Fortschritt wird pro Benutzer getrennt gespeichert und abgerufen

### 7.3 Hauptbildschirm (Dashboard)
Übersichtliche UI mit folgenden Bereichen:
- **Leaderboard**: Live-Vergleich aller drei Nutzer (Fleiss-Leaderboard)
- **Wort/Satz des Tages**: Tages-Impuls mit Vokabeln/Fortschritt
- **Nächste Lektionen**: Basierend auf Spaced Repetition und KI-Analyse
- **Vokabeltrainer**: Schneller Start für nächste SR-Wiederholungen

### 7.4 Navigation
- **Pro-Sprache Navigation**: Innerhalb jeder Sprache wechselsbar zwischen Funktionen:
  - Vokabeltrainer
  - Echtwelt-Szenarien (Dialog-basierte Konversationen)
  - Freier Chat-Sprachpartner
  - Lesetexte & Lückentexte
  - Grammatiktraining
  - Tests
- **Icons**: Übersichtliche, intuitive Icons für jede Funktion
- **Sprachwechsel**: Einfacher Switch zwischen Japanisch/Persisch/Portugiesisch

### 7.5 UI/UX Grundsätze (allgemein)
- **Mobile-first**: Optimiert für Smartphones, responsive für Desktop
- **Gamified Design**: Visuell ansprechend, motivierend, spielerisch
- **Themen-Orientierung**: Lernen nach Alltagssituationen und Leveln
- **Persische Lautschrift**: Toggle zwischen persischer Schrift und lateinischer Lautschrift

### 7.6 Hauptseiten

1. **Startbildschirm**: Drei Benutzer-Buttons (Luca, Darian, Tobi), Sprachauswahl, Bright/Dark Mode
2. **Dashboard**: Leaderboard, Wort/Satz des Tages, Nächste Lektionen, Vokabeltrainer-Start
3. **Vokabeltrainer**: Spaced-Repetition-Übungen mit automatischer KI-Generierung
4. **Konversationen**: Echtwelt-Szenarien und freier Chat-Sprachpartner
5. **Lesen**: Lesetexte und Lückentexte
6. **Grammatik**: Training und Erklärungen auf Abruf
7. **Tests**: Generierte Tests mit verschiedenen Element-Kombinationen
8. **Profil & Stats**: Eigene Statistiken, Achievements, Leaderboard-Vergleich
9. **Einstellungen**: Sprache, Benachrichtigungen, Lernziele, Lautschrift-Toggle, Theme-Wechsel

