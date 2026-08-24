/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'med-navy': '#1F2B6C',
        'med-blue': '#159EEC',
        'med-light-blue': '#BFD2F8',
        'med-ice': '#F4F9FF',
        'med-dark-text': '#252B42',
        'med-subtext': '#737373',
      },
    },
  },
  plugins: [],
}
