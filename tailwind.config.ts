import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        colors: {
          border: {
            DEFAULT: "#e4e4e7"
          },
          input: "#e4e4e7",
          ring: "#2563eb",
          background: "#f8fafc",
          foreground: "#1e293b",
          primary: {
            DEFAULT: "#2563eb",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#f5e9da",
            foreground: "#1e293b",
          },
          destructive: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
          muted: {
            DEFAULT: "#e0e7ef",
            foreground: "#64748b",
          },
          accent: {
            DEFAULT: "#14b8a6",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#22c55e",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#f59e42",
            foreground: "#ffffff",
          },
          popover: {
            DEFAULT: "#ffffff",
            foreground: "#1e293b",
          },
          card: {
            DEFAULT: "#ffffff",
            foreground: "#1e293b",
          },
        },
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
