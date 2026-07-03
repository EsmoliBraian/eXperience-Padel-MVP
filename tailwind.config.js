/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22E6B8',
          50:  '#f0fef9',
          100: '#A8F7E4',
          200: '#9af9e1',
          300: '#5deed0',
          400: '#18D3A7',
          500: '#22E6B8',
          600: '#10B98F',
          700: '#089070',
          800: '#0b725b',
          900: '#0b5e4c',
        },
        gray: {
          50:  '#F5F5F5',
          100: '#EFEFEF',
          200: '#DEDEDE',
          300: '#C5C7CB',
          400: '#94979E',
          500: '#7B7F86',
          600: '#666B73',
          700: '#393B42',
          800: '#383A40',
          900: '#222325',
          925: '#1C1D21',
          950: '#121212',
        },
        success: { DEFAULT: '#5EF2B2', bg: '#123A2B', border: '#1BB978', icon: '#22E6B8' },
        warning: { DEFAULT: '#FFD783', bg: '#3A2B10', border: '#F6B73C', icon: '#FFC857' },
        danger:  { DEFAULT: '#FFB4B4', bg: '#3A1717', border: '#E05252', icon: '#FF6666' },
        info:    { DEFAULT: '#A9D7FF', bg: '#132D44', border: '#4CA8FF', icon: '#59B2FF' },
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(34, 230, 184, 0.25)',
        'glow-sm':      '0 0 10px rgba(34, 230, 184, 0.15)',
        card: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
