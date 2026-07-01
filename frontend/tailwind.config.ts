import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        summit: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // teal core
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        alpine: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // emerald core
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        ember: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // warm orange core
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        void: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          900: '#0a0f1a',
          950: '#050810',
        },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'himalaya-gradient': 'linear-gradient(135deg, #050810 0%, #0a1628 40%, #0d2438 70%, #042f2e 100%)',
        'summit-glow':       'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.3), transparent)',
        'ember-glow':        'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(249,115,22,0.15), transparent)',
        'glass-surface':     'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':   '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        'summit':     '0 0 40px rgba(20,184,166,0.3)',
        'ember':      '0 0 40px rgba(249,115,22,0.3)',
        'glow-teal':  '0 0 60px rgba(20,184,166,0.4)',
        'card-hover': '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(20,184,166,0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 10s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 3s ease-in-out infinite',
        'slide-up':      'slideUp 0.6s ease-out',
        'fade-in':       'fadeIn 0.8s ease-out',
        'shimmer':       'shimmer 2s linear infinite',
        'orbit':         'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.3)' },
          '50%':      { boxShadow: '0 0 60px rgba(20,184,166,0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
