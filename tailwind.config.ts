import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            maxWidth: 'none',
            color: 'var(--foreground)',
            hr: {
              borderColor: 'var(--border)',
              marginTop: '3em',
              marginBottom: '3em'
            },
            'h1, h2, h3': {
              letterSpacing: '-0.025em',
            },
            h2: {
              marginBottom: '1em',
            },
            'ul, ol': {
              paddingLeft: '1.25em'
            },
            'li': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
          }
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate")
  ],
}

export default config
