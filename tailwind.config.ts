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
          50: '#EEF2F9',
          100: '#D4E1F3',
          200: '#A9C3E7',
          300: '#7EA5DB',
          400: '#5387CF',
          500: '#1B3A7D',  // Navy
          600: '#152E64',
          700: '#10234B',
          800: '#0A1732',
          900: '#050C19',
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
