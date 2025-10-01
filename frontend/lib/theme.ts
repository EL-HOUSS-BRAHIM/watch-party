export const themeConfig = {
  colors: {
    primary: {
      50: '#f0f4ff',
      100: '#e0e9ff',
      200: '#c8d5ff',
      300: '#a6b8ff',
      400: '#8492ff',
      500: '#667eea',
      600: '#5a67d8',
      700: '#4c51bf',
      800: '#434190',
      900: '#3c366b',
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      warning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      dark: 'linear-gradient(135deg, #2d1b3d 0%, #1a0d2e 50%, #0f0f23 100%)',
    }
  },
  
  shadows: {
    glow: {
      primary: '0 0 20px rgba(102, 126, 234, 0.3)',
      secondary: '0 0 20px rgba(236, 72, 153, 0.3)',
      success: '0 0 20px rgba(79, 172, 254, 0.3)',
      warning: '0 0 20px rgba(251, 191, 36, 0.3)',
      danger: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
    elevated: '0 10px 40px rgba(0, 0, 0, 0.3)',
    floating: '0 20px 60px rgba(0, 0, 0, 0.4)',
  },
  
  animations: {
    durations: {
      fast: '150ms',
      medium: '300ms',
      slow: '500ms',
    },
    easings: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
  },
  
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  spacing: {
    section: '6rem',
    container: '2rem',
    card: '1.5rem',
  },
  
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    }
  }
}

export type ThemeConfig = typeof themeConfig