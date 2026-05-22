import type { Dictionary } from './de';

// Stub fuer spaeter — wird derzeit nicht aktiv genutzt.
export const en: Dictionary = {
  app: {
    name: 'JaPerPo',
    tagline: 'Japanese - Persian - Portuguese',
  },
  nav: {
    dashboard: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Sign out',
    overview: 'Overview',
    vocab: 'Vocabulary',
    dialogues: 'Dialogues',
    chat: 'Chat',
    reading: 'Reading',
    grammar: 'Grammar',
    tests: 'Tests',
  },
  login: {
    title: 'Who is learning today?',
    subtitle: 'Pick your profile',
    continue: 'Continue',
  },
  dashboard: {
    welcome: 'Welcome back',
    leaderboard: 'Diligence leaderboard',
    sentenceOfTheDay: 'Sentence of the day',
    nextLessons: 'Up next',
    pickLanguage: 'Which language would you like to study?',
  },
  languages: {
    ja: 'Japanese',
    fa: 'Persian',
    pt: 'Portuguese',
  },
  settings: {
    title: 'Settings',
    theme: {
      label: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    transliteration: {
      label: 'Persian - Latin transliteration',
      hint: 'Useful when no Persian keyboard is available.',
    },
    uiLanguage: {
      label: 'App language',
      hint: 'Only German is currently active.',
    },
  },
  comingSoon: {
    title: 'In progress',
    description: 'This section is part of the vision — content is on the way.',
  },
  notFound: {
    title: 'Page not found',
    description: 'This page does not exist. Back to start?',
    cta: 'Back to start',
  },
  common: {
    back: 'Back',
    continue: 'Continue',
    save: 'Save',
    cancel: 'Cancel',
  },
};
