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
    ],
    darkTheme: "bedrocklight",
  },
};
