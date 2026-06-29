/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF8FF',
          100: '#DBEEFF',
          200: '#B9DEFE',
          300: '#88C6FC',
          400: '#199EF3',
          500: '#0082F0',
          600: '#006ACC',
          700: '#0052A0',
          800: '#003D78',
          900: '#0A2463',
        },
        dark: {
          bg:      '#0B1426',
          surface: '#112035',
          border:  '#1E3352',
          muted:   '#2A4A70',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        success: { DEFAULT: '#22C55E' },
        error:   { DEFAULT: '#EF4444' },
        warning: { DEFAULT: '#F59E0B' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 130, 240, 0.06)',
        card: '0 4px 24px rgba(0, 130, 240, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 130, 240, 0.14)',
        glow: '0 0 30px rgba(0, 130, 240, 0.25)',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        float:      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
