/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Usar variables CSS con soporte de opacidad (<alpha-value>)
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        background: 'rgb(var(--color-background-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        text: 'rgb(var(--color-text-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
        lg: 'var(--border-radius)',
        xl: 'calc(var(--border-radius) + 4px)',
        '2xl': 'calc(var(--border-radius) + 8px)',
        '3xl': 'calc(var(--border-radius) + 16px)', // Para coincidir con estilos modernos
      }
    },
  },
  plugins: [],
}
