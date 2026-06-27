/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#1a1c23',
          700: '#3a3d49',
          500: '#5b5f6e',
          400: '#8a8e9c',
          300: '#b6b9c5',
        },
        paper: {
          DEFAULT: '#f7f6f3',
          card: '#ffffff',
          edge: '#e8e6e0',
        },
        brand: {
          DEFAULT: '#4338ca',
          soft: '#eef0fb',
          ring: '#c7cbf0',
        },
        stage: {
          applied: '#6b7280',
          reviewing: '#b45309',
          interview: '#4338ca',
          offer: '#15803d',
          rejected: '#be123c',
          not_selected: '#6d28d9',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,28,35,0.04), 0 4px 16px rgba(26,28,35,0.05)',
        lift: '0 8px 28px rgba(67,56,202,0.12)',
      },
      borderRadius: { xl2: '14px' },
    },
  },
  plugins: [],
};
