import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-yellow-100',
    'text-yellow-800',
    'bg-sky-100',
    'text-sky-800',
    'bg-blue-600',
    'text-white',
    'bg-blue-50',
    'text-blue-700',
    'bg-purple-100',
    'text-purple-800',
    'bg-indigo-100',
    'text-indigo-800',
    'bg-green-100',
    'text-green-800',
    'bg-red-100',
    'text-red-800',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A84C',
          dark: '#B8963F',
          /** Text on gold buttons / badges */
          foreground: '#1A1408',
          light: '#D4AF37',
        },
        secondary: {
          DEFAULT: '#1D3557',
          light: '#457B9D',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C9A84C',
          dark: '#B8963F',
        },
        success: '#2D6A4F',
        background: '#070D1A',
        surface: '#0D1628',
        muted: {
          DEFAULT: '#0A1220',
          foreground: '#8A9BB8',
        },
        border: '#1A2840',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.35)',
        'card-hover': '0 8px 24px rgba(201,168,76,0.12)',
        glow: '0 0 20px rgba(201,168,76,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
