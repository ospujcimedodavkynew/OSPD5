/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#111827',
        'surface': '#1F2937',
        'primary': '#3B82F6',
        'primary-focus': '#2563EB',
        'secondary': '#8B5CF6',
        'accent': '#F59E0B',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
