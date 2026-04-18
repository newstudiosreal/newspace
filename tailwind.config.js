/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0b',
          secondary: '#111113',
          tertiary: '#1a1a1e',
          card: '#141416',
          hover: '#1e1e22',
        },
        accent: {
          yellow: '#f5c518',
          'yellow-dim': '#f5c51820',
          'yellow-hover': '#f5c518cc',
        },
        border: {
          primary: '#2a2a2e',
          secondary: '#222226',
        },
        text: {
          primary: '#f0f0f2',
          secondary: '#8888a0',
          muted: '#555568',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-yellow': 'pulseYellow 0.4s ease',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(12px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        pulseYellow: { '0%,100%': { color: '#f0f0f2' }, '50%': { color: '#f5c518', transform: 'scale(1.2)' } },
      }
    },
  },
  plugins: [],
}
