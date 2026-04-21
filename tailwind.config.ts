import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        accent: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        perplexity: "#20808D",
        "hard-runway": "#3B82F6",
        "extended-runway": "#8B5CF6",
        "stables-area": "#10B981",
        "fiat-area": "#6366F1",
        "volatile-major": "#F59E0B",
        "volatile-native": "#EC4899",
        "volatile-alt": "#06B6D4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
