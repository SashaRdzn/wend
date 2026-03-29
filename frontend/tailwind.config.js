export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Great', '"Segoe Script"', 'cursive'],
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#faf9f6',
        ink: '#6b705c',
        sage: '#a3b18a',
        sand: '#e3d5ca',
        moss: '#4a5243',
        blush: {
          50: '#f4f6f1',
          100: '#e8ebe3',
          200: '#d4dcc8',
          400: '#a3b18a',
          500: '#6b705c',
        },
        champagne: '#5c6654',
      },
    },
  },
  plugins: [],
}
