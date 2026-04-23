/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        youtubeRed: '#FF0000',
        darkSurface: '#121212',
        cardBg: '#1e2920', 
        primaryAccent: '#2d6a4f', 
        bgMain: '#081c15', 
      }
    },
  },
  plugins: [],
}