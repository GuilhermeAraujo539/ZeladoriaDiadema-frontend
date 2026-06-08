import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eaecf8',
          100: '#c9ceee',
          200: '#a5ace3',
          300: '#808bd8',
          400: '#6470cf',
          500: '#4856c5',
          600: '#3b47b8',
          700: '#2c37a5',
          800: '#1c2891',
          900: '#071a4f',
          950: '#03102e',
        },
        gold: '#d4a017',
        'gold-light': '#f0c842',
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease forwards',
        bounce3:    'bounce3 1.1s infinite',
        'fade-in':  'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        slideUp:  { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        bounce3:  { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-4px)' } },
        fadeIn:   { from: { opacity:'0' }, to: { opacity:'1' } },
      },
    },
  },
  plugins: [],
};

export default config;
