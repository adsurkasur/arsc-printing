import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        code: ["var(--font-code)", "monospace"],
      },
      spacing: {
        space0: "0px",
        space1: "4px",
        space2: "8px",
        space3: "12px",
        space4: "16px",
        space5: "20px",
        space6: "24px",
        space8: "32px",
        space10: "40px",
        space12: "48px",
        space16: "64px",
        space20: "80px",
        space24: "96px",
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        s: "8px",
        m: "12px",
        l: "16px",
        lPlus: "20px",
        xl: "28px",
        xlPlus: "32px",
        xxl: "48px",
        full: "9999px",
        // Keep shadcn compatibility aliases
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "elevation-0": "var(--elevation-0)",
        "elevation-1": "var(--elevation-1)",
        "elevation-2": "var(--elevation-2)",
        "elevation-3": "var(--elevation-3)",
        "elevation-4": "var(--elevation-4)",
        "elevation-5": "var(--elevation-5)",
      },
      colors: {
        // Shadcn tokens
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // M3 System Color Roles (§2)
        "md-sys-color": {
          primary: "var(--md-sys-color-primary)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          "primary-fixed": "var(--md-sys-color-primary-fixed)",
          "primary-fixed-dim": "var(--md-sys-color-primary-fixed-dim)",
          "on-primary-fixed": "var(--md-sys-color-on-primary-fixed)",
          "on-primary-fixed-variant": "var(--md-sys-color-on-primary-fixed-variant)",

          secondary: "var(--md-sys-color-secondary)",
          "on-secondary": "var(--md-sys-color-on-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
          "secondary-fixed": "var(--md-sys-color-secondary-fixed)",
          "secondary-fixed-dim": "var(--md-sys-color-secondary-fixed-dim)",
          "on-secondary-fixed": "var(--md-sys-color-on-secondary-fixed)",
          "on-secondary-fixed-variant": "var(--md-sys-color-on-secondary-fixed-variant)",

          tertiary: "var(--md-sys-color-tertiary)",
          "on-tertiary": "var(--md-sys-color-on-tertiary)",
          "tertiary-container": "var(--md-sys-color-tertiary-container)",
          "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
          "tertiary-fixed": "var(--md-sys-color-tertiary-fixed)",
          "tertiary-fixed-dim": "var(--md-sys-color-tertiary-fixed-dim)",
          "on-tertiary-fixed": "var(--md-sys-color-on-tertiary-fixed)",
          "on-tertiary-fixed-variant": "var(--md-sys-color-on-tertiary-fixed-variant)",

          error: "var(--md-sys-color-error)",
          "on-error": "var(--md-sys-color-on-error)",
          "error-container": "var(--md-sys-color-error-container)",
          "on-error-container": "var(--md-sys-color-on-error-container)",

          surface: "var(--md-sys-color-surface)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "surface-dim": "var(--md-sys-color-surface-dim)",
          "surface-bright": "var(--md-sys-color-surface-bright)",
          "surface-container-lowest": "var(--md-sys-color-surface-container-lowest)",
          "surface-container-low": "var(--md-sys-color-surface-container-low)",
          "surface-container": "var(--md-sys-color-surface-container)",
          "surface-container-high": "var(--md-sys-color-surface-container-high)",
          "surface-container-highest": "var(--md-sys-color-surface-container-highest)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",

          "inverse-surface": "var(--md-sys-color-inverse-surface)",
          "inverse-on-surface": "var(--md-sys-color-inverse-on-surface)",
          "inverse-primary": "var(--md-sys-color-inverse-primary)",
          scrim: "var(--md-sys-color-scrim)",
          shadow: "var(--md-sys-color-shadow)",
        },
        "md-custom-color": {
          warning: "var(--md-custom-color-warning)",
          "on-warning": "var(--md-custom-color-on-warning)",
          "warning-container": "var(--md-custom-color-warning-container)",
          "on-warning-container": "var(--md-custom-color-on-warning-container)",
          info: "var(--md-custom-color-info)",
          "on-info": "var(--md-custom-color-on-info)",
          "info-container": "var(--md-custom-color-info-container)",
          "on-info-container": "var(--md-custom-color-on-info-container)",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
