import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* ===== PALETTE "DARK NEON" ===== */
        neon: {
          bg: '#070B1F',
          'bg-secondary': '#111A3A',
          card: '#151C44',
          cyan: '#6EE7F9',
          purple: '#C084FC',
          interact: '#7C3AED',
          border: '#2C3566',
        },
        teal: {
          DEFAULT: '#0F766E',
          hover: '#0D9488',
          light: '#CCFBF1',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        emerald: {
          DEFAULT: '#6EE7F9',
          hover: '#5AD8EA',
          dark: '#38BDF8',
          light: '#A5F3FC',
          50: '#0C1A3A',
          100: '#111A3A',
          200: '#1E3A5F',
          300: '#38BDF8',
          400: '#6EE7F9',
          500: '#6EE7F9',
          600: '#38BDF8',
          700: '#0EA5E9',
          800: '#0284C7',
          900: '#0C4A6E',
        },
        interface: '#070B1F',
        navy: {
          DEFAULT: '#070B1F',
          light: '#2C3566',
          100: '#A7B0D6',
          200: '#6B7AAD',
          300: '#4A5580',
          600: '#111A3A',
          700: '#0D1330',
          800: '#070B1F',
        },
        primary: {
          DEFAULT: '#F3F6FF',
          foreground: '#070B1F',
        },
        secondary: {
          DEFAULT: '#A7B0D6',
          foreground: '#F3F6FF',
        },
        success: {
          DEFAULT: '#6EE7F9',
          light: '#0C1A3A',
          dark: '#38BDF8',
        },
        gray: {
          50: '#0C1029',
          100: '#111A3A',
          200: '#2C3566',
          300: '#4A5580',
          400: '#6B7AAD',
          500: '#A7B0D6',
          600: '#C4CAE0',
          700: '#D4D9EB',
          800: '#E8ECF5',
          900: '#F3F6FF',
        },
        slate: {
          50: '#0C1029',
          100: '#111A3A',
          200: '#2C3566',
          300: '#4A5580',
          400: '#6B7AAD',
          500: '#A7B0D6',
          600: '#C4CAE0',
          700: '#D4D9EB',
          800: '#E8ECF5',
          900: '#F3F6FF',
        },
        zinc: {
          50: '#0C1029',
          100: '#111A3A',
          200: '#2C3566',
          300: '#4A5580',
          400: '#6B7AAD',
          500: '#A7B0D6',
          600: '#C4CAE0',
          700: '#D4D9EB',
          800: '#E8ECF5',
          900: '#F3F6FF',
        },
        /* ===== COULEURS SEMANTIQUES SHADCN ===== */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
        'md': '6px',
        'sm': '4px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)',
        'button': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'sidebar': '4px 0 12px rgba(0, 0, 0, 0.3)',
        'emerald': '0 0 20px rgba(110, 231, 249, 0.2)',
        'teal': '0 0 20px rgba(110, 231, 249, 0.15)',
        'neon-glow': '0 0 30px rgba(110, 231, 249, 0.15)',
        'neon-purple': '0 0 30px rgba(192, 132, 252, 0.15)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(180deg, #111A3A 0%, #070B1F 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #6EE7F9 0%, #38BDF8 100%)',
        'gradient-hero': 'linear-gradient(135deg, #111A3A 0%, #070B1F 100%)',
        'gradient-runner': 'linear-gradient(180deg, #070B1F 0%, #111A3A 100%)',
        'gradient-neon': 'linear-gradient(135deg, #6EE7F9, #C084FC)',
        'gradient-neon2': 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
