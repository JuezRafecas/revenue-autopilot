import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0A09',
          raised: '#141210',
          sunken: '#080706',
          elevated: '#1C1A17',
        },
        fg: {
          DEFAULT: '#F5F2EC',
          muted: '#A8A29A',
          subtle: '#5C5852',
          faint: '#3A3733',
        },
        hairline: {
          DEFAULT: '#262320',
          strong: '#33302C',
        },
        accent: {
          DEFAULT: '#E8B769',
          dim: '#B88A4A',
        },
        segment: {
          vip: '#E8B769',
          active: '#8FAE8B',
          new: '#7FA2C7',
          at_risk: '#D4A574',
          dormant: '#C86A52',
          lead: '#9E8FB8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 7vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        label: '0.12em',
        mono: '0.04em',
      },
      maxWidth: {
        editorial: '1440px',
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'marquee': 'marquee 60s linear infinite',
        'draw': 'draw 1.4s ease-out forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
