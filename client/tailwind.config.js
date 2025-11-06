/** @type {import('tailwindcss').Config} */
import { fontFamily as defaultTheme } from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 'Lato' will be the default
        sans: ["Lato", ...defaultTheme.fontFamily.sans],
        // 'Merriweather' will be used for headings (e.g., font-serif)
        serif: ["Merriweather", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
