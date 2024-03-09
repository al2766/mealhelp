/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '80': '20rem', // This adds a 'w-80' utility class with a value of 20rem
      },
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeOut: {
          'from': { transform: 'translateY(0px)',
            opacity: '1',
           
          },
          'to': {  transform: 'translateY(-30px)',
            opacity: '0',
          
          }
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'zoom-in': 'zoomIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
