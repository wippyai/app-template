import PrimeUI from 'tailwindcss-primeui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts}',
  ],
  theme: {
    extend: {
      colors: {
        secondary: {
          50: 'var(--p-secondary-50)',
          100: 'var(--p-secondary-100)',
          200: 'var(--p-secondary-200)',
          300: 'var(--p-secondary-300)',
          400: 'var(--p-secondary-400)',
          500: 'var(--p-secondary-500)',
          600: 'var(--p-secondary-600)',
          700: 'var(--p-secondary-700)',
          800: 'var(--p-secondary-800)',
          900: 'var(--p-secondary-900)',
          950: 'var(--p-secondary-950)',
        },
      },
    },
  },
  plugins: [PrimeUI],
}
