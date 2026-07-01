/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#15F5BA',
          50:  '#f0fef9',
          100: '#ccfdf0',
          200: '#9af9e1',
          300: '#5deed0',
          400: '#2adcba',
          500: '#15F5BA',
          600: '#07b589',
          700: '#089070',
          800: '#0b725b',
          900: '#0b5e4c',
        },
        gray: {
          50:  '#F8F8F8',
          100: '#EFEFEF',
          200: '#DEDEDE',
          300: '#C2C2C2',
          400: '#9A9A9A',
          500: '#777777',
          600: '#555555',
          700: '#363636',
          800: '#252525',
          900: '#1A1A1A',
          950: '#0F0F0F',
        },
        success: { DEFAULT: '#4ADE80', dark: '#16A34A' },
        warning: { DEFAULT: '#FB923C', dark: '#C2410C' },
        danger:  { DEFAULT: '#F87171', dark: '#DC2626' },
        info:    { DEFAULT: '#38BDF8', dark: '#0284C7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(21, 245, 186, 0.25)',
        'glow-sm':      '0 0 10px rgba(21, 245, 186, 0.15)',
      },
    },
  },
  plugins: [],
}
