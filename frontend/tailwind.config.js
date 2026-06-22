/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        prime: {
          blue: '#3b82f6',
          dark: '#0d0d0d',
          card: '#171717',
          border: '#222',
        },
      },
    },
  },
  plugins: [],
}
