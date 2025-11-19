/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FCDF4C',
        dark: '#0D0D0D',
      },
    },
  },
  plugins: [],
}

