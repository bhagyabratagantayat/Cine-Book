/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#141414',
        surface: '#1f1f1f',
        primary: '#E50914',
        secondary: '#f5c518',
        accent: '#7C3AED',
      }
    },
  },
  plugins: [],
}
