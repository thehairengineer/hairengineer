/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        josefin: ['var(--font-josefin)'],
        bonheur: ['var(--font-bonheur)'],
        montserrat: ['var(--font-montserrat)'],
        sans: ['Bebas Neue', 'sans-serif'],
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
          neon: '#ff36b8',
          bright: '#ff1493',
          glow: '#ff71ce',
        },
        dark: {
          100: '#1a1a1a',
          200: '#242424',
          300: '#333333',
          400: '#4a4a4a',
          500: '#5c5c5c',
          900: '#121212',
        },
        primary: {
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
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      boxShadow: {
        'neon-pink': '0 0 10px rgba(255, 54, 184, 0.7), 0 0 20px rgba(255, 54, 184, 0.5)',
        'neon-pink-lg': '0 0 15px rgba(255, 54, 184, 0.7), 0 0 30px rgba(255, 54, 184, 0.5)',
      },
    },
  },
  plugins: [],
} 