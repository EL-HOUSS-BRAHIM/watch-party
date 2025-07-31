import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinema-inspired Color System
        cinema: {
          deep: "hsl(var(--cinema-deep))",
          dark: "hsl(var(--cinema-dark))",
          medium: "hsl(var(--cinema-medium))",
          surface: "hsl(var(--cinema-surface))",
          elevated: "hsl(var(--cinema-elevated))",
        },
        
        // Neon Accent Colors
        neon: {
          red: "hsl(var(--neon-red))",
          blue: "hsl(var(--neon-blue))",
          purple: "hsl(var(--neon-purple))",
          gold: "hsl(var(--neon-gold))",
          green: "hsl(var(--neon-green))",
        },
        
        // Text System
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          disabled: "hsl(var(--text-disabled))",
        },
        
        // Glow Effects
        glow: {
          primary: "hsl(var(--glow-primary))",
          secondary: "hsl(var(--glow-secondary))",
          success: "hsl(var(--glow-success))",
          warning: "hsl(var(--glow-warning))",
          error: "hsl(var(--glow-error))",
        },

        // Shadcn/UI Colors (maintained for compatibility)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Monaco", "monospace"],
      },
      
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1.1" }],
        "9xl": ["8rem", { lineHeight: "1.1" }],
      },
      
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      
      backdropBlur: {
        xs: "2px",
      },
      
      boxShadow: {
        "cinema-sm": "var(--shadow-sm)",
        "cinema-md": "var(--shadow-md)",
        "cinema-lg": "var(--shadow-lg)",
        "cinema-xl": "var(--shadow-xl)",
        "glow-sm": "0 0 10px hsl(var(--glow-primary) / 0.3)",
        "glow-md": "0 0 20px hsl(var(--glow-primary) / 0.5)",
        "glow-lg": "0 0 30px hsl(var(--glow-primary) / 0.7)",
        "glow-xl": "0 0 40px hsl(var(--glow-primary) / 0.9)",
      },
      
      keyframes: {
        // Enhanced animations
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.9)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--glow-primary) / 0.5)" 
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(var(--glow-primary) / 0.8)" 
          },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-400% 0" },
          "100%": { backgroundPosition: "400% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "ripple": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        
        // Shadcn compatibility
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
        // Custom animations
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.8s ease-out forwards",
        "slide-down": "slide-down 0.8s ease-out forwards",
        "slide-left": "slide-left 0.6s ease-out forwards",
        "slide-right": "slide-right 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "scale-out": "scale-out 0.4s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out",
        
        // Shadcn compatibility
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      
      backgroundImage: {
        "cinema-gradient": "linear-gradient(135deg, hsl(var(--cinema-deep)) 0%, hsl(var(--cinema-dark)) 50%, hsl(var(--cinema-medium)) 100%)",
        "neon-gradient": "linear-gradient(135deg, hsl(var(--neon-red)) 0%, hsl(var(--neon-purple)) 50%, hsl(var(--neon-blue)) 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      
      transitionTimingFunction: {
        "cinema": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for glass morphism utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-weak': {
          backgroundColor: 'var(--glass-weak)',
          backdropFilter: 'var(--backdrop-blur)',
        },
        '.glass-medium': {
          backgroundColor: 'var(--glass-medium)',
          backdropFilter: 'var(--backdrop-blur)',
        },
        '.glass-strong': {
          backgroundColor: 'var(--glass-strong)',
          backdropFilter: 'var(--backdrop-blur)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
