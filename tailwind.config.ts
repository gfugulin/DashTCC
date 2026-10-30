import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mackenzie: {
          red: "#EB0029",
          darkRed: "#B8001F",
          deepRed: "#8A0017",
          softRed: "#FDF0F2",
          borderRed: "#F7B8C2",
          black: "#111111",
          dark: "#1A1A1A",
          charcoal: "#262626",
          gray: "#333333",
          lightGray: "#F4F6F8",
          // mantendo retrocompatibilidade para classes existentes
          50: "#FDF0F2",
          100: "#FCE4E7",
          200: "#F7B8C2",
          600: "#EB0029",
          700: "#B8001F",
          800: "#8A0017",
          900: "#6B0012",
        },
        gad: {
          minima: "#16A34A",
          leve: "#D97706",
          moderada: "#EA580C",
          grave: "#DC2626",
        }
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      }
    },
  },
  plugins: [],
};

export default config;
