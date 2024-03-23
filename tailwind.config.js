/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animationDelay: { // This is custom, Tailwind doesn't support it by default
        'delay-100': '100ms',
        'delay-200': '200ms',
        'delay-300': '300ms',
        // Add more as needed
      },
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
        fadeOutAndCollapse: {
          '0%': {
            opacity: '1',
            maxHeight: '100px', // Adjust to match the content's natural height or use 'none' for auto
            margin: '8px', // Adjust if your items have margin
            padding: '8px', // Adjust if your items have padding
          },
          '100%': {
            opacity: '0',
            maxHeight: '0',
            margin: '0',
            padding: '0',
          },
        },
        slideFadeOut: {
          from: { transform: 'translateX(0%)', opacity: 1 },
          to: { transform: 'translateX(-50%)', opacity: 0 },
        },
        slideFadeIn: {
          from: { transform: 'translateX(50%)', opacity: 0 },
          to: { transform: 'translateX(0%)', opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'zoom-in': 'zoomIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-out',
        'fade-out-and-collapse': 'fadeOutAndCollapse 0.5s ease-out forwards',
        'slide-fade-out': 'slideFadeOut 0.5s forwards',
        'slide-fade-in': 'slideFadeIn 0.5s forwards',
        'fadeInUp': 'fadeInUp 0.5s ease-out forwards', // Add 'forwards' here
        'fadeInDown': 'fadeInDown 0.5s ease-out',


      },
    },
  },
  plugins: [
    require('tailwindcss-animation-delay'), // Make sure to install this plugin
  ],
}
