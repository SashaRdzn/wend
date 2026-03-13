/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        blush: {
          50: '#fff7f8',
          100: '#ffe9ee',
          200: '#ffd0db',
          400: '#f78ca2',
          500: '#f26c88',
        },
        ink: '#1b1230',
        champagne: '#fdf4e3',
      },
    },
  },
  plugins: [],
}

