/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          'orange-dark': '#EA580C',
          blue: '#3B82F6',
          'blue-dark': '#2563EB',
          green: '#22C55E',
          'green-dark': '#16A34A',
          purple: '#A78BFA',
          'purple-dark': '#7C3AED',
          cream: '#FEF9EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
