/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: '#f8f5ef',
        snake: '#427757',
        'snake-head': '#27523b',
        food: '#c04b4b',
      },
    },
  },
  plugins: [],
}
