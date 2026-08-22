/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          900: '#0F172A',
          700: '#1E3A5F',
          500: '#3B82F6',
        },
        // Semantic
        success:  '#10B981',
        warning:  '#F59E0B',
        danger:   '#F43F5E',
        info:     '#06B6D4',
        // Backgrounds & surfaces
        'bg-primary':  '#F8FAFC',
        'bg-surface':  '#FFFFFF',
        // Text
        'text-primary':   '#1E293B',
        'text-secondary': '#64748B',
        // Border
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2rem',    { fontWeight: '700', lineHeight: '1.2' }],
        'h2': ['1.5rem',  { fontWeight: '600', lineHeight: '1.3' }],
        'h3': ['1.25rem', { fontWeight: '600', lineHeight: '1.35' }],
        'body': ['1rem',  { fontWeight: '400', lineHeight: '1.6' }],
        'caption': ['0.875rem', { fontWeight: '400', lineHeight: '1.5' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
      borderRadius: {
        'btn':   '6px',
        'input': '8px',
        'card':  '12px',
        'modal': '16px',
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        'modal': '0 20px 60px rgba(0,0,0,.18)',
        'sidebar': '2px 0 8px rgba(0,0,0,.06)',
      },
      screens: {
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
