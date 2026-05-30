import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary temporal colors
        now: '#00e5ff',
        accent: '#6b8cff',
        future: '#8c6bff',
        
        // Background zones
        bg: {
          primary: '#0a0a1a',
          secondary: '#0f0f1e',
          void: '#030308',
          abyss: '#060612',
          'deep-space': '#0a0a1a',
          surface: '#0f0f1e',
        },
        
        // Text colors
        text: {
          primary: '#e8e8f0',
          secondary: '#a0a0c8',
          tertiary: '#606080',
        },
        
        // Layer colors
        layer: {
          personal: '#6b8cff',
          professional: '#00e5ff',
          social: '#ff6b9d',
          health: '#00ffc8',
          learning: '#ff8c00',
          creative: '#8c6bff',
        },
      },
      fontFamily: {
        display: ['Syne', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-now': 'pulseNow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseNow: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.45' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 229, 255, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(0, 229, 255, 0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config