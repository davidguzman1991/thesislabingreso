import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        thesis: {
          primary: "#0D1B2A",
          accent: "#2EC4B6",
          background: "#F8FAFC",
          border: "#E2E8F0",
          muted: "#64748B",
          card: "#FFFFFF",
          alert: "#F59E0B",
          pending: "#94A3B8"
        }
      },
      boxShadow: {
        soft: "0 1px 2px rgba(13, 27, 42, 0.06), 0 8px 24px rgba(13, 27, 42, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
