/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#00c9a7',
          dark: '#00a889',
          light: '#33d4b7',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideRight: {
          from: { transform: 'translateX(-16px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
