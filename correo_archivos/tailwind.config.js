/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,php}"],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        'card-bg': '#ffffff',
        'success-bg': '#ecfdf5',
        'success-text': '#065f46',
        'error-bg': '#fef2f2',
        'error-text': '#991b1b',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
