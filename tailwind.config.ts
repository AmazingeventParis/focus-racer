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
        /* ===== PALETTE "FRESH GREEN" ===== */
        neon: {
          bg: '#F8FAF9',
          'bg-secondary': '#F0FDF4',
          card: '#FFFFFF',
          cyan: '#10B981',
          purple: '#8B5CF6',
          interact: '#059669',
          border: '#E2E8F0',
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
          950: '#042F2E',
        },
        emerald: {
          DEFAULT: '#10B981',
          hover: '#059669',
          dark: '#047857',
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
        interface: '#F8FAF9',
        navy: {
          DEFAULT: '#042F2E',
          light: '#115E59',
          100: '#99F6E4',
          200: '#5EEAD4',
          300: '#2DD4BF',
          600: '#134E4A',
          700: '#115E59',
          800: '#042F2E',
        },
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#475569',
          foreground: '#0F172A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          dark: '#059669',
        },
        /* Standard Tailwind gray/slate/zinc — restored to defaults */
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        slate: {
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
        zinc: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
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
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sidebar': '4px 0 12px rgba(0, 0, 0, 0.05)',
        'emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
        'teal': '0 0 20px rgba(16, 185, 129, 0.12)',
        'neon-glow': '0 0 30px rgba(16, 185, 129, 0.12)',
        'neon-purple': '0 0 30px rgba(139, 92, 246, 0.1)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(180deg, #042F2E 0%, #115E59 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-hero': 'linear-gradient(135deg, #042F2E 0%, #115E59 100%)',
        'gradient-runner': 'linear-gradient(180deg, #F8FAF9 0%, #F0FDF4 100%)',
        'gradient-neon': 'linear-gradient(135deg, #10B981, #059669)',
        'gradient-neon2': 'linear-gradient(135deg, #059669, #0D9488)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
