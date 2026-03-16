/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        bedrocklight: {
          primary: "#1877F2",
          "primary-content": "#ffffff",
          secondary: "#325CA8",
          "secondary-content": "#ffffff",
          accent: "#0EA5A5",
          "accent-content": "#ffffff",
          neutral: "#1F2A44",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f7fc",
          "base-300": "#e5eaf2",
          "base-content": "#0f172a",
          info: "#0ea5e9",
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
      {
        bedrockdark: {
          primary: "#60a5fa",
          "primary-content": "#081121",
          secondary: "#38bdf8",
          "secondary-content": "#081121",
          accent: "#22c55e",
          "accent-content": "#081121",
          neutral: "#0f172a",
          "neutral-content": "#e5eefc",
          "base-100": "#111827",
          "base-200": "#0b1220",
          "base-300": "#172033",
          "base-content": "#e5eefc",
          info: "#38bdf8",
          success: "#4ade80",
          warning: "#fbbf24",
          error: "#f87171",
        },
      },
    ],
    darkTheme: "bedrockdark",
  },
};
