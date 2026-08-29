/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#EFF3F3',
        ink: '#152B3C',
        surgical: '#3E7C74',
        marigold: '#E1A83E',
        'rank-red': '#B23A34',
        line: '#C3CFCE',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
