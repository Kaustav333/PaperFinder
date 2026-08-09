/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      },
      colors: {
        accent: '#1e3a8a', // Deep blue
      }
    },
  },
  plugins: [],
}
