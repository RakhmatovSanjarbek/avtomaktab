// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#0B0E13",
          900: "#12161D",
          800: "#1B2029",
          700: "#272E3A",
        },
        route: {
          400: "#5B8DEF",
          500: "#3568C9",
          600: "#254D9E",
        },
        signal: {
          400: "#F2B705",
          500: "#D99E02",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};
export default config;