/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0E1B2E',
        'navy-soft': '#142539',
        'navy-line': '#1d3050',
        cream: '#F7F3EA',
        'cream-soft': '#EDE6D6',
        gold: '#F2B137',
        'gold-soft': '#F8C868',
        ngreen: '#2E8B57',
        'ngreen-soft': '#3CA86A',
        muted: '#A9B6C9',
        slate2: '#445263'
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        gold: '0 10px 40px -10px rgba(242,177,55,0.45)',
        card: '0 8px 30px -12px rgba(14,27,46,0.18)'
      }
    }
  },
  plugins: []
}
