/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        brand: "#1D4ED8",
        brandHover: "#1E40AF",
        cream: "#F7F7F5",
        paper: "#FFFFFF",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Instrument Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: "0 10px 40px rgba(17,19,24,0.08)",
        card: "0 8px 30px rgba(17,19,24,0.06)",
      },
    },
  },
  plugins: [],
}
