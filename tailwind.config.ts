import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "ui-sans-serif",
          "SF Pro Text",
          "Inter",
          "sans-serif",
        ],
      },
      colors: {
        surface: "#f5f5f7",
        ink: "#0b0b0f",
        accent: {
          DEFAULT: "#0071e3",
          soft: "#e5f0ff",
        },
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15,23,42,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
