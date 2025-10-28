/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind should scan files inside the client `src` folder — when this file
  // lives in `client/` the content path should be relative to that folder.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
