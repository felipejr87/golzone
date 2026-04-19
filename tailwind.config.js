/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        divino: {
          red:      '#E8232A',
          redDark:  '#C41E24',
          redGlow:  'rgba(232,35,42,0.25)',
          redBg:    'rgba(232,35,42,0.08)',
          base:     '#060608',
          card:     '#0F1117',
          card2:    '#161820',
          elevated: '#1C1E28',
          overlay:  'rgba(6,6,8,0.92)',
        },
        score: {
          elite: '#FFD700',
          great: '#4ADE80',
          good:  '#60A5FA',
          avg:   '#F59E0B',
          poor:  '#EF4444',
        },
        live:      '#22C55E',
        scheduled: '#60A5FA',
        ended:     '#4A5068',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['80px', { lineHeight: '1',   letterSpacing: '.06em' }],
        'display-lg': ['64px', { lineHeight: '1',   letterSpacing: '.06em' }],
        'display-md': ['48px', { lineHeight: '1',   letterSpacing: '.05em' }],
        'display-sm': ['36px', { lineHeight: '1',   letterSpacing: '.04em' }],
        'display-xs': ['28px', { lineHeight: '1',   letterSpacing: '.04em' }],
        'h1':     ['24px', { lineHeight: '1.2', letterSpacing: '-.01em', fontWeight: '700' }],
        'h2':     ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3':     ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'body':   ['14px', { lineHeight: '1.6' }],
        'label':  ['11px', { lineHeight: '1',   letterSpacing: '.08em' }],
        'caption':['12px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        'card': '12px',
        'hero': '20px',
      },
      boxShadow: {
        'live':  '0 0 24px rgba(232,35,42,0.3), 0 4px 16px rgba(0,0,0,0.5)',
        'score': '0 0 20px #FFD700',
        'card':  '0 2px 12px rgba(0,0,0,0.4)',
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [],
}
