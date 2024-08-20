/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
        sohne: ["sohne", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        lgc: "17px",
      },
      colors: {
        green: {
          custom: "#22c55e",
        },
        grey: {
          custom: "#F3F3F3",
          dark: "#1e1e1e",
          placeholder: "#A9A9AC",
          index: "#e5e7eb",
        },
      },
    },
  },
  plugins: [],
};
