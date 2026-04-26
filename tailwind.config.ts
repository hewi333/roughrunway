import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // shadcn HSL primitives (values driven by CSS vars in app/globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Swiss Aviation brand palette — Day Flying (light)
        "swiss-red": "#DC2626",
        "aviation-green": "#2E7D32",
        "aviation-red": "#C62828",
        "knob-gold": "#D4A574",
        "knob-silver": "#B8B8B8",
        "sky-blue": "#6FA3D4",
        "mountain-white": "#F5F5F5",
        ink: "#1A1A1A",
        "ink-secondary": "#6B6B6B",

        // Night Flying (dark) variants
        "primary-dark": "#0F1115",
        "panel-dark": "#1A1D23",
        "aviation-green-dark": "#4ADE80",
        "aviation-red-dark": "#F87171",
        "sky-blue-dark": "#5B9BD5",
        "knob-gold-dark": "#C9966A",
        "knob-silver-dark": "#8A8A8A",

        // Chart series tokens — values updated to Swiss palette so existing
        // chart components pick up the new colors without a rename.
        // Phase 3 may rename these to swiss-red / sky-blue / etc. directly.
        perplexity: "#D4A574",
        // Brand teal used for the Perplexity logo + "Market Pulse" wordmark.
        // Kept separate from the gold chart token so charts don't shift.
        "perplexity-teal": "#20B8CD",
        "hard-runway": "#DC2626",
        "extended-runway": "#6FA3D4",
        "stables-area": "#2E7D32",
        "fiat-area": "#6FA3D4",
        "volatile-major": "#D4A574",
        "volatile-native": "#DC2626",
        "volatile-alt": "#B8B8B8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        knob: "9999px",
        panel: "8px",
        precise: "4px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", '"Helvetica Neue"', "Arial", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", '"Helvetica Neue"', "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "-0.005em", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem" }],
        body: ["0.875rem", { lineHeight: "1.25rem" }],
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "500" }],
        placard: ["0.625rem", { lineHeight: "0.875rem", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      transitionDuration: {
        80: "80ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "shiny-text": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 60s linear infinite",
        "shiny-text": "shiny-text 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
