/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241016',      // near-black wine — dark sections, header
        burgundy: '#7A1F2B', // primary accent
        gold: '#C9A24B',     // royal gold — dividers, highlights
        cream: '#FAF3E7',    // light background
        blush: '#F3E1DD',    // secondary light accent
        charcoal: '#2B2225', // body text on cream
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
