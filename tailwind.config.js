/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
          contrast: 'rgb(var(--color-accent-contrast) / <alpha-value>)',
        },
        // Sprach-Akzente (statische Werte, falls direkt referenziert):
        sakura: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#ffc9d4',
          300: '#ffa0b3',
          400: '#ff6f8b',
          500: '#ff4570',
          600: '#ed1d59',
          700: '#c8124a',
          800: '#a51244',
          900: '#88143f',
        },
        teal: {
          50: '#eefcfb',
          100: '#d3f7f5',
          200: '#a9eeec',
          300: '#74dedd',
          400: '#3fb6b5',
          500: '#1f9c9d',
          600: '#177c80',
          700: '#156268',
          800: '#144f55',
          900: '#0f3f45',
        },
        tinto: {
          50: '#fbf2f3',
          100: '#f5dfe2',
          200: '#ecbcc2',
          300: '#dd8e98',
          400: '#c95e6c',
          500: '#a93849',
          600: '#8a2837',
          700: '#7a1f2b',
          800: '#5f1b25',
          900: '#451720',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 14px rgb(0 0 0 / 0.06)',
        'card-lg': '0 4px 8px rgb(0 0 0 / 0.04), 0 16px 32px rgb(0 0 0 / 0.08)',
        'card-dark': '0 1px 2px rgb(0 0 0 / 0.4), 0 4px 14px rgb(0 0 0 / 0.5)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 240ms ease-out',
        pop: 'pop 200ms ease-out',
      },
    },
  },
  plugins: [],
};
