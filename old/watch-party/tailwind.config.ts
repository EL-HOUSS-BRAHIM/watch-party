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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CSS Variables for dynamic theming
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Neo Stadium Glow Base Colors (Dark-first theme)
        "neo-background": "#0E0E10",      // Main app background
        "neo-surface": "#1A1A1D",         // Cards, modals, chat bubbles
        "neo-surface-elevated": "#242428", // Elevated surfaces
        "neo-border": "#2E2E32",          // Dividers, outlines
        "neo-border-strong": "#3A3A3F",   // Strong borders
        
        // Text Hierarchy
        "neo-text-primary": "#FFFFFF",     // Main text
        "neo-text-secondary": "#B3B3B3",  // Secondary text
        "neo-text-tertiary": "#8A8A8A",   // Tertiary/muted text
        "neo-text-inverse": "#0E0E10",    // Inverse text on light backgrounds

        // Primary Brand Color (Electric Blue)
        primary: {
          50: "#E8F8FF",
          100: "#D1F1FF", 
          200: "#A3E3FF",
          300: "#75D5FF",
          400: "#47C7FF",
          500: "#3ABEF9",    // Main Electric Blue
          600: "#2EA8E0",
          700: "#2292C7",
          800: "#167CAE",
          900: "#0A6695",
          DEFAULT: "#3ABEF9",
          foreground: "#FFFFFF"
        },

        // Success Color (Lime Glow)
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#9FF87A",    // Main Lime Glow
          500: "#4ADE80",
          600: "#22C55E",
          700: "#16A34A",
          800: "#15803D",
          900: "#166534",
          DEFAULT: "#9FF87A",
          foreground: "#0E0E10"
        },

        // Warning Color (Amber)
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FFC857",    // Main Amber
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#FFC857",
          foreground: "#0E0E10"
        },

        // Error/Destructive Color (Rad Red)
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2", 
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#FF3B3B",    // Main Rad Red
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          DEFAULT: "#FF3B3B",
          foreground: "#FFFFFF"
        },
        destructive: {
          DEFAULT: "#FF3B3B",
          foreground: "#FFFFFF"
        },

        // Highlight/Focus Color (Electric Cyan)
        highlight: {
          50: "#F0FDFF",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14FFEC",    // Main Focus/Highlight
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          DEFAULT: "#14FFEC",
          foreground: "#0E0E10"
        },

        // Premium Color (Gold)
        premium: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#FFD700",    // Main Gold
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#FFD700",
          foreground: "#0E0E10"
        },

        // Violet Pop (Secondary accent)
        violet: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C5FFF",    // Main Violet Pop
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          DEFAULT: "#7C5FFF",
          foreground: "#FFFFFF"
        },

        // Soft Pink (Emotive UX)
        pink: {
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#FF69B4",    // Main Soft Pink
          600: "#EC4899",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
          DEFAULT: "#FF69B4",
          foreground: "#FFFFFF"
        },

        // Standard Shadcn UI Colors (maintained for compatibility)
        card: {
          DEFAULT: "#1A1A1D",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#1A1A1D",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2E2E32",
          foreground: "#B3B3B3",
        },
        muted: {
          DEFAULT: "#2E2E32",
          foreground: "#8A8A8A",
        },
        accent: {
          DEFAULT: "#2E2E32",
          foreground: "#B3B3B3",
        },
      },
      
      // Gradient Utilities
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3ABEF9, #7C5FFF)',
        'gradient-success': 'linear-gradient(135deg, #9FF87A, #4ADE80)',
        'gradient-premium': 'linear-gradient(135deg, #FFD700, #FFC857)',
        'gradient-glow': 'radial-gradient(circle, rgba(58, 190, 249, 0.1) 0%, transparent 70%)',
        'gradient-surface': 'linear-gradient(145deg, #1A1A1D, #242428)',
      },

      // Box Shadow with Glow Effects
      boxShadow: {
        'glow-primary': '0 0 20px rgba(58, 190, 249, 0.3)',
        'glow-success': '0 0 20px rgba(159, 248, 122, 0.3)',
        'glow-highlight': '0 0 20px rgba(20, 255, 236, 0.3)',
        'glow-premium': '0 0 20px rgba(255, 215, 0, 0.3)',
        'neo-card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'neo-surface': '0 4px 16px rgba(0, 0, 0, 0.2)',
      },

      // Border Radius for Neo aesthetic
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'neo': '12px',
        'neo-lg': '16px',
      },

      // Typography
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      // Animation and Transitions
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
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
        "glow-pulse": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0.4" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom Neo Stadium Glow utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-gradient-primary': {
          'background': 'linear-gradient(135deg, #3ABEF9, #7C5FFF)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-premium': {
          'background': 'linear-gradient(135deg, #FFD700, #FFC857)',
          '-webkit-background-clip': 'text', 
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.bg-gradient-glow': {
          'background': 'radial-gradient(circle at center, rgba(58, 190, 249, 0.05) 0%, transparent 70%)',
        },
        '.card': {
          'background': '#1A1A1D',
          'border': '1px solid #2E2E32',
          'border-radius': '12px',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.btn-primary': {
          'background': 'linear-gradient(135deg, #3ABEF9, #2EA8E0)',
          'color': '#FFFFFF',
          'border': 'none',
          'border-radius': '8px',
          'padding': '0.75rem 1.5rem',
          'font-weight': '600',
          'transition': 'all 0.2s ease',
          '&:hover': {
            'box-shadow': '0 0 20px rgba(58, 190, 249, 0.4)',
            'transform': 'translateY(-1px)',
          }
        },
        '.btn-secondary': {
          'background': '#2E2E32',
          'color': '#B3B3B3',
          'border': '1px solid #3A3A3F',
          'border-radius': '8px',
          'padding': '0.75rem 1.5rem',
          'font-weight': '500',
          'transition': 'all 0.2s ease',
          '&:hover': {
            'background': '#3A3A3F',
            'color': '#FFFFFF',
          }
        },
        '.input-base': {
          'background': '#1A1A1D',
          'border': '1px solid #2E2E32',
          'border-radius': '8px',
          'color': '#FFFFFF',
          'padding': '0.75rem 1rem',
          '&:focus': {
            'outline': 'none',
            'border-color': '#3ABEF9',
            'box-shadow': '0 0 0 3px rgba(58, 190, 249, 0.1)',
          }
        }
      }
      
      addUtilities(newUtilities)
    }
  ],
}

export default config
