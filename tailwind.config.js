/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f5f8',
          100: '#e8e8ee',
          200: '#d0d0da',
          300: '#b0b0be',
          400: '#8888a0',
          500: '#606078',
          600: '#484860',
          700: '#353548',
          800: '#252535',
          900: '#181825',
          950: '#0e0e18',
        },
        silver: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8ec',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        navy: {
          800: '#111118',
          900: '#0a0a10',
          950: '#050508',
        },
        accent: {
          50: '#f0f0f5',
          100: '#dddde8',
          200: '#b8b8d0',
          300: '#9090b0',
          400: '#6868a0',
          500: '#484880',
          600: '#383868',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.1), 0 2px 6px 0 rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
