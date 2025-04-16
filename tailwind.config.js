/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        josefin: ['var(--font-josefin)'],
        bonheur: ['var(--font-bonheur)'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        dark: {
          100: '#1a1a1a',
          200: '#242424',
          300: '#333333',
          400: '#4a4a4a',
          500: '#5c5c5c',
          900: '#121212',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
      },
    },
  },
  plugins: [],
} 