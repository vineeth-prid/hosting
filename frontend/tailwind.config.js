/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'deep-teal': '#0D2B2C',
        'teal-hover': '#164042',
        'warm-sand': '#D1A783',
        'sand-light': '#F8F6F2',
        'body-text': '#4A5555',
        'heading': '#0B1B1C',
        'border-sand': '#E3DCD1',
      },
      fontFamily: {
        'heading': ['"Cormorant Garamond"', 'serif'],
        'body': ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
