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
        /* ===== PALETTE "TEAL + EMERALD" ===== */
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
          DEFAULT: '#10B981',
          hover: '#059669',
          dark: '#059669',
          light: '#6EE7B7',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        interface: '#F8FAFC',
        navy: {
          DEFAULT: '#042F2E',
          light: '#134E4A',
          100: '#CBD5E1',
          200: '#94A3B8',
          300: '#64748B',
          600: '#115E59',
          700: '#134E4A',
          800: '#042F2E',
        },
        primary: {
          DEFAULT: '#042F2E',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#64748B',
          foreground: '#042F2E',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
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
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'button': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'sidebar': '4px 0 6px -1px rgb(0 0 0 / 0.1)',
        'emerald': '0 4px 14px -3px rgba(16, 185, 129, 0.4)',
        'teal': '0 4px 14px -3px rgba(15, 118, 110, 0.3)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(180deg, #0F766E 0%, #115E59 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F766E 0%, #042F2E 100%)',
        'gradient-runner': 'linear-gradient(180deg, #042F2E 0%, #134E4A 100%)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
