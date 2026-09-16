/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  corePlugins: {
    // Disable Tailwind CSS reset to prevent conflicts with Bootstrap 5
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
