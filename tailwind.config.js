/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'music-bar': {
          '0%, 100%': { height: '10%' },
          '50%': { height: '100%' },
        }
      },
      animation: {
        'music-bar': 'music-bar 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}