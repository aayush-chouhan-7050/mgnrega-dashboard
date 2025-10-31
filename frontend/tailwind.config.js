/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'mgnrega-green': '#4CAF50',
        'mgnrega-blue': '#2196F3'
      },
      fontFamily: {
        'hindi': ['Noto Sans Devanagari', 'sans-serif']
      }
    }
  },
  plugins: []
};