import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050B17",
        panel: "#0A1326",
        card: "#111C34",
        primary: "#2563EB",
        accent: "#3B82F6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      boxShadow: {
        glow: "0 0 34px rgba(37, 99, 235, 0.22)",
        card: "0 20px 80px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
