import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Template Design System Colors
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
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        heading: ['var(--font-public-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-public-sans)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        small: '0.75rem',
        large: '1.5rem',
      },
      boxShadow: {
        custom: '0px 4px 20px -2px rgba(148, 163, 184, 0.1)',
        'custom-hover': '0px 10px 25px -5px rgba(148, 163, 184, 0.15)',
      },
      letterSpacing: {
        heading: '-0.02em',
      },
    },
  },
  plugins: [],
}
export default config
