/** @type {import('tailwindcss').Config} */
export default {
darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75',
          },
          accent: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
          },
          dark: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        },
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'display': ['Poppins', 'system-ui', 'sans-serif'],
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'float-delayed': 'float 6s ease-in-out infinite 2s',
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 3s infinite',
          'gradient': 'gradient 15s ease infinite',
          'shimmer': 'shimmer 2s linear infinite',
          'slide-up': 'slideUp 0.5s ease-out',
          'slide-down': 'slideDown 0.5s ease-out',
          'fade-in': 'fadeIn 0.5s ease-out',
          'scale-in': 'scaleIn 0.3s ease-out',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          gradient: {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            },
          },
          shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
          slideUp: {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          scaleIn: {
            '0%': { transform: 'scale(0.9)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
        },
        backdropBlur: {
          xs: '2px',
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
          'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
          'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
          'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        },
      },
    },
    plugins: [],
  }
  