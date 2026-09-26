/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0f172a',
        panel: '#131c2e',
        panelborder: '#1e293b',
        cyan: {
          glow: '#22d3ee',
        },
        magenta: {
          glow: '#e879f9',
        },
        lime: {
          glow: '#a3e635',
        },
      },
      keyframes: {
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        modalIn: 'modalIn 0.25s ease-out',
        toastIn: 'toastIn 0.3s ease-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
