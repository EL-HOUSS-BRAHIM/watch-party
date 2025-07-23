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

        // Neo Stadium Glow Base Colors
        "neo-background": "#0E0E10",
        "neo-surface": "#1A1A1D",
        "neo-border": "#2E2E32",
        "neo-text-primary": "#FFFFFF",
        "neo-text-secondary": "#B3B3B3",

        // Accent Colors (Glow + Emotion)  
        primary: {
          50: "#E8F8FF",
          100: "#D1F1FF",
          200: "#A3E3FF",
          300: "#75D5FF",
          400: "#47C7FF",
          500: "#3ABEF9", // Electric Blue - Main
          600: "#2EA8E0",
          700: "#2292C7",
          800: "#167CAE",
          900: "#0A6695",
          DEFAULT: "#3ABEF9",
          foreground: "#FFFFFF"
        },
        
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#9FF87A", // Lime Glow - Main
          500: "#4ADE80",
          600: "#22C55E",
          700: "#16A34A",
          800: "#15803D",
          900: "#166534",
          DEFAULT: "#9FF87A",
          foreground: "#0E0E10"
        },
        
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FFC857", // Amber - Main
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#FFC857",
          foreground: "#0E0E10"
        },
        
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#FF3B3B", // Rad Red - Main
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          DEFAULT: "#FF3B3B",
          foreground: "#FFFFFF"
        },
        
        highlight: {
          50: "#F0FDFF",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14FFEC", // Focus/Highlight - Main
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          DEFAULT: "#14FFEC",
          foreground: "#0E0E10"
        },
        
        premium: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#FFD700", // Gold - Main
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#FFD700",
          foreground: "#0E0E10"
        },
        
        violet: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C5FFF", // Violet Pop - Main
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          DEFAULT: "#7C5FFF",
          foreground: "#FFFFFF"
        },
        
        pink: {
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#FF69B4", // Soft Pink - Main
          600: "#EC4899",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
          DEFAULT: "#FF69B4",
          foreground: "#FFFFFF"
        },
        "neo-surface-elevated": "#242428",
        "neo-border": "#2E2E32",
        "neo-border-strong": "#3A3A3F",

        // Text Hierarchy
        "neo-text": {
          primary: "#FFFFFF",
          secondary: "#B3B3B3",
          tertiary: "#8A8A8A",
          inverse: "#0E0E10",
        },

        // Primary Brand System
        primary: {
          DEFAULT: "#3ABEF9",
          50: "#E6F9FF",
          100: "#B3EFFF",
          200: "#80E5FF",
          300: "#4DDBFF",
          400: "#1AD1FF",
          500: "#3ABEF9",
          600: "#28A8E0",
          700: "#1692C7",
          800: "#047CAE",
          900: "#006695",
          foreground: "#FFFFFF",
        },

        // Accent Colors with Glow Effects
        success: {
          DEFAULT: "#9FF87A",
          50: "#F4FFE6",
          100: "#E6FFB3",
          200: "#D8FF80",
          300: "#CAFF4D",
          400: "#BCFF1A",
          500: "#9FF87A",
          600: "#8AE061",
          700: "#75C848",
          800: "#60B02F",
          900: "#4B9816",
          foreground: "#0E0E10",
        },

        warning: {
          DEFAULT: "#FFC857",
          50: "#FFF8E6",
          100: "#FFECB3",
          200: "#FFE080",
          300: "#FFD44D",
          400: "#FFC81A",
          500: "#FFC857",
          600: "#E6B34E",
          700: "#CC9E45",
          800: "#B3893C",
          900: "#997433",
          foreground: "#0E0E10",
        },

        error: {
          DEFAULT: "#FF3B3B",
          50: "#FFE6E6",
          100: "#FFB3B3",
          200: "#FF8080",
          300: "#FF4D4D",
          400: "#FF1A1A",
          500: "#FF3B3B",
          600: "#E63535",
          700: "#CC2F2F",
          800: "#B32929",
          900: "#992323",
          foreground: "#FFFFFF",
        },

        // Special Effect Colors
        focus: {
          DEFAULT: "#14FFEC",
          50: "#E6FFFC",
          100: "#B3FFF7",
          200: "#80FFF2",
          300: "#4DFFED",
          400: "#1AFFE8",
          500: "#14FFEC",
          600: "#12E6D4",
          700: "#10CCBC",
          800: "#0EB3A4",
          900: "#0C998C",
        },

        premium: {
          DEFAULT: "#FFD700",
          50: "#FFFDF0",
          100: "#FFF9D9",
          200: "#FFF4B3",
          300: "#FFEF8C",
          400: "#FFEA66",
          500: "#FFD700",
          600: "#E6C200",
          700: "#CCAD00",
          800: "#B39800",
          900: "#998300",
          foreground: "#0E0E10",
        },

        violet: {
          DEFAULT: "#7C5FFF",
          50: "#F3ECFF",
          100: "#E1CCFF",
          200: "#CFADFF",
          300: "#BD8DFF",
          400: "#AB6DFF",
          500: "#7C5FFF",
          600: "#6D55E6",
          700: "#5E4BCC",
          800: "#4F41B3",
          900: "#403799",
          foreground: "#FFFFFF",
        },

        pink: {
          DEFAULT: "#FF69B4",
          50: "#FFE6F2",
          100: "#FFB3D9",
          200: "#FF80C0",
          300: "#FF4DA7",
          400: "#FF1A8E",
          500: "#FF69B4",
          600: "#E65FA2",
          700: "#CC5590",
          800: "#B34B7E",
          900: "#99416C",
          foreground: "#FFFFFF",
        },

        // Live streaming specific
        live: {
          DEFAULT: "#FF4444",
          glow: "#FF6B6B",
          pulse: "#FF8888",
          foreground: "#FFFFFF",
        },

        // Existing shadcn colors (keep for compatibility)
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
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
        "160": "40rem",
        "176": "44rem",
        "192": "48rem",
      },
      boxShadow: {
        // Glow effects for Neo Stadium theme
        "glow-sm": "0 0 10px rgba(58, 190, 249, 0.3)",
        glow: "0 0 20px rgba(58, 190, 249, 0.4)",
        "glow-lg": "0 0 40px rgba(58, 190, 249, 0.5)",
        "glow-xl": "0 0 60px rgba(58, 190, 249, 0.6)",
        "glow-2xl": "0 0 80px rgba(58, 190, 249, 0.7)",

        // Accent glows
        "success-glow": "0 0 20px rgba(159, 248, 122, 0.4)",
        "warning-glow": "0 0 20px rgba(255, 200, 87, 0.4)",
        "error-glow": "0 0 20px rgba(255, 59, 59, 0.4)",
        "premium-glow": "0 0 30px rgba(255, 215, 0, 0.4)",
        "focus-glow": "0 0 15px rgba(20, 255, 236, 0.5)",
        "live-glow": "0 0 25px rgba(255, 68, 68, 0.5)",
        "violet-glow": "0 0 20px rgba(124, 95, 255, 0.4)",
        "pink-glow": "0 0 20px rgba(255, 105, 180, 0.4)",

        // Subtle shadows for depth
        "neo-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        neo: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "neo-md": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "neo-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        "neo-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        // Enhanced animations for premium feel
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "live-pulse": "live-pulse 1.5s ease-in-out infinite",
        "premium-shimmer": "premium-shimmer 2s linear infinite",
        "focus-ring": "focus-ring 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(58, 190, 249, 0.4)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(58, 190, 249, 0.8)",
          },
        },
        "live-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
            boxShadow: "0 0 25px rgba(255, 68, 68, 0.5)",
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.05)",
            boxShadow: "0 0 35px rgba(255, 68, 68, 0.8)",
          },
        },
        "premium-shimmer": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
        },
        "focus-ring": {
          "0%": {
            boxShadow: "0 0 0 0 rgba(20, 255, 236, 0.7)",
          },
          "100%": {
            boxShadow: "0 0 0 4px rgba(20, 255, 236, 0)",
          },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "40px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3ABEF9 0%, #7C5FFF 100%)",
        "gradient-success": "linear-gradient(135deg, #9FF87A 0%, #3ABEF9 100%)",
        "gradient-premium": "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
        "gradient-live": "linear-gradient(135deg, #FF4444 0%, #FF6B6B 100%)",
        "gradient-surface": "linear-gradient(135deg, #1A1A1D 0%, #242428 100%)",
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient": "radial-gradient(at 40% 20%, hsla(190,90%,70%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(285,70%,70%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(45,90%,70%,0.1) 0px, transparent 50%)",
        "video-overlay": "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
        "chat-gradient": "linear-gradient(180deg, rgba(26,26,29,0.95) 0%, rgba(26,26,29,1) 100%)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        // Glow utilities
        '.glow-primary': {
          boxShadow: '0 0 20px rgba(58, 190, 249, 0.4)',
        },
        '.glow-success': {
          boxShadow: '0 0 20px rgba(159, 248, 122, 0.4)',
        },
        '.glow-premium': {
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
        },
        '.glow-live': {
          boxShadow: '0 0 25px rgba(255, 68, 68, 0.5)',
        },
        // Text gradient utilities
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, #3ABEF9 0%, #7C5FFF 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-premium': {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        // Button styles
        '.btn-primary': {
          background: 'linear-gradient(135deg, #3ABEF9 0%, #7C5FFF 100%)',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 0 20px rgba(58, 190, 249, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-premium': {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          color: '#0E0E10',
          '&:hover': {
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        '.btn-live': {
          background: 'linear-gradient(135deg, #FF4444 0%, #FF6B6B 100%)',
          color: '#FFFFFF',
          animation: 'live-pulse 1.5s ease-in-out infinite',
        },
        // Card styles
        '.card': {
          backgroundColor: '#1A1A1D',
          borderColor: '#2E2E32',
          borderWidth: '1px',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
        '.card-elevated': {
          backgroundColor: '#242428',
          borderColor: '#3A3A3F',
          borderWidth: '1px',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        },
        // Input styles
        '.input-base': {
          backgroundColor: '#1A1A1D',
          borderColor: '#2E2E32',
          color: '#FFFFFF',
          '&:focus': {
            borderColor: '#14FFEC',
            boxShadow: '0 0 0 3px rgba(20, 255, 236, 0.1)',
          },
          '&::placeholder': {
            color: '#8A8A8A',
          },
        },
        // Video player specific
        '.video-overlay': {
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
        },
        '.chat-bubble-self': {
          backgroundColor: '#3ABEF9',
          color: '#FFFFFF',
        },
        '.chat-bubble-other': {
          backgroundColor: '#2E2E32',
          color: '#B3B3B3',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config
