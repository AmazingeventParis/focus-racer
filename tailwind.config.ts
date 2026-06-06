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
        /* ===== PALETTE "TRAIL ENERGY" (clair) ===== */
        /* vert nature (#059669) + orange sport (#F97316) sur fond blanc */

        /* Surfaces — anciens noms "neon" repointes vers du clair */
        neon: {
          bg: '#F8FAFC',          // fond de page (slate-50)
          'bg-secondary': '#F1F5F9',
          card: '#FFFFFF',        // cartes blanches
          cyan: '#059669',        // ex-cyan -> vert marque
          purple: '#F97316',      // ex-violet -> orange energie
          interact: '#059669',
          border: '#E2E8F0',      // slate-200
        },
        /* Vert marque (Trail green) — reutilise les noms teal/emerald deja cables */
        teal: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#D1FAE5',
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
        emerald: {
          DEFAULT: '#059669',
          hover: '#047857',
          dark: '#065F46',
          light: '#D1FAE5',
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
        /* Orange energie (CTA forts : Acheter / Upload / Telecharger) */
        energy: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          dark: '#C2410C',
          light: '#FFEDD5',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        brand: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#D1FAE5',
        },
        interface: '#FFFFFF',
        /* navy -> neutres fonces (texte sombre + sections sombres type footer) */
        navy: {
          DEFAULT: '#0F172A',
          light: '#E2E8F0',
          100: '#F1F5F9',
          200: '#64748B',
          300: '#94A3B8',
          600: '#1E293B',
          700: '#0F172A',
          800: '#020617',
        },
        primary: {
          DEFAULT: '#0F172A',   // texte principal fonce
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#475569',   // texte secondaire
          foreground: '#0F172A',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        /* Echelles neutres REMISES A L'ENDROIT (standard Tailwind) */
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
        /* Ombres douces de theme clair (fini les halos neon noirs) */
        'card': '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px rgba(15, 23, 42, 0.10), 0 4px 8px rgba(15, 23, 42, 0.05)',
        'button': '0 1px 2px rgba(15, 23, 42, 0.08)',
        'sidebar': '1px 0 0 rgba(15, 23, 42, 0.06)',
        'emerald': '0 4px 14px rgba(5, 150, 105, 0.25)',
        'teal': '0 4px 14px rgba(5, 150, 105, 0.20)',
        'neon-glow': '0 4px 14px rgba(5, 150, 105, 0.18)',
        'neon-purple': '0 4px 14px rgba(249, 115, 22, 0.18)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(180deg, #F1F5F9 0%, #FFFFFF 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-hero': 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 60%, #FFF7ED 100%)',
        'gradient-runner': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-neon': 'linear-gradient(135deg, #059669, #F97316)',
        'gradient-neon2': 'linear-gradient(135deg, #10B981, #059669)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
