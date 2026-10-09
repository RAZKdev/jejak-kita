import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFBF7', // Warm ivory
        surface: '#F4EFEA', // Soft beige
        'surface-elevated': '#FFFFFF',
        border: '#E7DFD5', // Sand border
        foreground: '#242220', // Charcoal
        'foreground-muted': '#6B655F', // Muted charcoal
        brand: {
          DEFAULT: '#1C3B2B', // Deep green (forest / pine)
          hover: '#254E39',
          subtle: '#EBF2EE',
        },
        accent: {
          brown: '#7C6A59', // Muted brown / earth
          warm: '#B85D38', // Terracotta accent
          amber: '#D97706',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'var(--font-serif)',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
