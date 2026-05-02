import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        // TalentBridge light palette (tb-*) + legacy tl-* aliases
        tb: {
          indigo: '#4F46E5',
          'indigo-light': '#6366F1',
          'indigo-pale': '#EEF2FF',
          emerald: '#059669',
          amber: '#D97706',
          rose: '#E11D48',
          sky: '#0284C7',
          'bg-base': '#F0F4FF',
          'bg-surface': '#FFFFFF',
          'bg-elevated': '#F8FAFF',
          'bg-overlay': '#EEF2FF',
          'text-primary': '#111827',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          'border-default': '#E5E7EB',
          'border-strong': 'rgba(79,70,229,0.35)',
        },
        tl: {
          gold: '#4F46E5',
          'gold-light': '#6366F1',
          'gold-dim': '#3730A3',
          teal: '#059669',
          rose: '#E11D48',
          blue: '#0284C7',
          'bg-base': '#F0F4FF',
          'bg-surface': '#FFFFFF',
          'bg-elevated': '#F8FAFF',
          'bg-overlay': '#EEF2FF',
          'text-primary': '#111827',
          'text-secondary': '#6B7280',
          'text-muted': '#9CA3AF',
          'border-subtle': 'rgba(17,24,39,0.05)',
          'border-default': '#E5E7EB',
          'border-strong': 'rgba(79,70,229,0.35)',
          'border-gold': 'rgba(79,70,229,0.3)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4F46E5 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0.04) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #F0F4FF 0%, #F8FAFF 50%, #EEF2FF 100%)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.08) 0%, transparent 60%)',
        'mesh-gold': 'radial-gradient(at 40% 20%, rgba(79,70,229,0.06) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(5,150,105,0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(225,29,72,0.03) 0px, transparent 50%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'var(--font-mono)', 'monospace'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gold-pulse': 'goldPulse 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.5), 0 0 80px rgba(201,168,76,0.2)' },
        },
        drawLine: {
          from: { strokeDashoffset: '1000' },
          to: { strokeDashoffset: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'gold': '0 4px 16px rgba(79,70,229,0.18)',
        'gold-lg': '0 8px 30px rgba(79,70,229,0.25)',
        'teal': '0 4px 16px rgba(5,150,105,0.18)',
        'card': '0 1px 3px rgba(17,24,39,0.08), 0 4px 12px rgba(17,24,39,0.04)',
        'card-hover': '0 4px 20px rgba(17,24,39,0.10), 0 0 0 1px rgba(79,70,229,0.12)',
        'elevated': '0 10px 40px rgba(17,24,39,0.12)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
