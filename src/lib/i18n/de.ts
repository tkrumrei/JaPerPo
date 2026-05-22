export interface Dictionary {
  app: {
    name: string;
    tagline: string;
  };
  nav: {
    dashboard: string;
    profile: string;
    settings: string;
    logout: string;
    overview: string;
    vocab: string;
    dialogues: string;
    chat: string;
    reading: string;
    grammar: string;
    tests: string;
  };
  login: {
    title: string;
    subtitle: string;
    continue: string;
  };
  dashboard: {
    welcome: string;
    leaderboard: string;
    sentenceOfTheDay: string;
    nextLessons: string;
    pickLanguage: string;
  };
  languages: {
    ja: string;
    fa: string;
    pt: string;
  };
  settings: {
    title: string;
    theme: {
      label: string;
      light: string;
      dark: string;
      system: string;
    };
    transliteration: {
      label: string;
      hint: string;
    };
    uiLanguage: {
      label: string;
      hint: string;
    };
  };
  comingSoon: {
    title: string;
    description: string;
  };
  notFound: {
    title: string;
    description: string;
    cta: string;
  };
  common: {
    back: string;
    continue: string;
    save: string;
    cancel: string;
  };
}

export const de: Dictionary = {
  app: {
    name: 'JaPerPo',
    tagline: 'Japanisch · Persisch · Portugiesisch',
  },
  nav: {
    dashboard: 'Start',
    profile: 'Profil',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    overview: 'Uebersicht',
    vocab: 'Vokabeln',
    dialogues: 'Dialoge',
    chat: 'Chat',
    reading: 'Lesen',
    grammar: 'Grammatik',
    tests: 'Tests',
  },
  login: {
    title: 'Wer lernt heute?',
    subtitle: 'Waehle dein Profil',
    continue: 'Weiter',
  },
  dashboard: {
    welcome: 'Willkommen zurueck',
    leaderboard: 'Fleiss-Leaderboard',
    sentenceOfTheDay: 'Satz des Tages',
    nextLessons: 'Naechste Lektionen',
    pickLanguage: 'Welche Sprache moechtest du lernen?',
  },
  languages: {
    ja: 'Japanisch',
    fa: 'Persisch',
    pt: 'Portugiesisch',
  },
  settings: {
    title: 'Einstellungen',
    theme: {
      label: 'Erscheinungsbild',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
    },
    transliteration: {
      label: 'Persisch — lateinische Lautschrift',
      hint: 'Hilfreich, wenn keine persische Tastatur verfuegbar ist.',
    },
    uiLanguage: {
      label: 'Sprache der App',
      hint: 'Aktuell nur Deutsch verfuegbar.',
    },
  },
  comingSoon: {
    title: 'In Arbeit',
    description: 'Dieser Bereich ist Teil der Vision — die Inhalte folgen in Kuerze.',
  },
  notFound: {
    title: 'Seite nicht gefunden',
    description: 'Diese Seite existiert nicht. Zurueck zur Startseite?',
    cta: 'Zur Startseite',
  },
  common: {
    back: 'Zurueck',
    continue: 'Weiter',
    save: 'Speichern',
    cancel: 'Abbrechen',
  },
};
