/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        kiosk: {
          blue: '#0284c7',
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#06b6d4',
        }
      },
      fontSize: {
        'kiosk-xl': ['2rem', { lineHeight: '2.5rem' }],
        'kiosk-2xl': ['2.75rem', { lineHeight: '3.25rem' }],
        'kiosk-3xl': ['3.5rem', { lineHeight: '4rem' }],
      }
    },
  },
  plugins: [],
}
