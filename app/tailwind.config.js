/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy gradient colors
        navy: {
          900: '#0f172a',
          800: '#1e3a5f',
          700: '#0c4a6e',
          600: '#0e4e73',
        },
        // Glassmorphism colors
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.12)',
          active: 'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.15)',
          'border-light': 'rgba(255, 255, 255, 0.1)',
        },
        // Primary - Blue (padrão do app)
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        // Secondary - Teal
        secondary: {
          DEFAULT: '#2dd4bf',
          light: '#5eead4',
          dark: '#14b8a6',
        },
        // Tertiary - Amber
        tertiary: {
          DEFAULT: '#fbbf24',
          light: '#fcd34d',
          dark: '#f59e0b',
        },
        // Text on dark
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-muted': 'rgba(255, 255, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'button': '14px',
        'input': '12px',
        'modal': '24px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'touch': '48px',
        'touch-lg': '56px',
        'card': '20px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-light': '12px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
    },
  },
  plugins: [],
}
