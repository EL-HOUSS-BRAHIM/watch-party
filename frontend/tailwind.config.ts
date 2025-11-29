import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // New Logo-Inspired Brand Colors
        brand: {
          magenta: {
            DEFAULT: "#E9408A",
            dark: "#d12975",
            light: "#f56ba8",
          },
          purple: {
            DEFAULT: "#4A2EA0",
            dark: "#391f7d",
            light: "#6341c4",
          },
          blue: {
            DEFAULT: "#2D9CDB",
            dark: "#1d7fb8",
            light: "#4db1e8",
          },
          cyan: {
            DEFAULT: "#3BC6E8",
            dark: "#28a8c9",
            light: "#5fd4f0",
          },
          orange: {
            DEFAULT: "#F39C12",
            dark: "#d4850a",
            light: "#f7b345",
          },
          coral: {
            DEFAULT: "#FF5E57",
            dark: "#e64540",
            light: "#ff7f79",
          },
          neutral: {
            DEFAULT: "#F5F1EB",
            light: "#faf8f5",
            dark: "#e8e2d8",
          },
          navy: {
            DEFAULT: "#1C1C2E",
            light: "#2d2d45",
            dark: "#0f0f1a",
          },
        },
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.1)",
          strong: "rgba(255, 255, 255, 0.15)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        status: {
          online: "#10b981",
          away: "#f59e0b",
          busy: "#ef4444",
          offline: "#6b7280",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glow-lg': '0 0 40px rgba(167, 139, 250, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'floating': '0 20px 60px rgba(0, 0, 0, 0.4)',
      },
      blur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}

export default config
