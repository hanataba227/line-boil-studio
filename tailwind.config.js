/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        'secondary-bg': '#F5F5F5',
        'app-text': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
