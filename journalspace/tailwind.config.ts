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
        sage: {
          50: "#f6f7f6",
          100: "#e3e7e3",
          200: "#c7d0c7",
          300: "#a3b2a3",
          400: "#7d917d",
          500: "#627562",
          600: "#4d5d4d",
          700: "#404c40",
          800: "#363f36",
          900: "#2f352f",
          950: "#181c18",
        },
        warm: {
          50: "#fdfcfb",
          100: "#f9f6f3",
          200: "#f3ece5",
          300: "#e9ddd1",
          400: "#d9c4b0",
          500: "#c9ab91",
          600: "#b58f72",
          700: "#9a7660",
          800: "#7f6251",
          900: "#685145",
          950: "#372a23",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
