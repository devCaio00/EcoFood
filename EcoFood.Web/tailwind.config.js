/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ecofood: {
          verde: "#27633f",
          claro: "#e8f5e9",
          ambar: "#c97a2b",
        },
      },
    },
  },
  plugins: [],
};