/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
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
      animation: {
        "shadow-pulse-1": "shadowPulse 1s infinite",
        "shadow-pulse-2": "shadowPulse 2s infinite",
        "shadow-pulse-3": "shadowPulse 3s infinite",
        "shadow-pulse-4": "shadowPulse 4s infinite",
        "shadow-pulse-5": "shadowPulse 5s infinite",
      },
      keyframes: {
        shadowPulse: {
          "0%, 100%": { boxShadow: "var(--tw-shadow)" },
          "50%": { boxShadow: "var(--tw-shadow-expanded)" },
        },
      },
    },
  },
  plugins: [],
};
