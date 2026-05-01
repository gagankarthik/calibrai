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
        // TalentLoop native palette
        tl: {
          gold: '#C9A84C',
          'gold-light': '#E8C96A',
          'gold-dim': '#8A6F2E',
          teal: '#1ECDB3',
          rose: '#FF5C7A',
          blue: '#4A9FFF',
          'bg-base': '#0A0B0F',
          'bg-surface': '#111318',
          'bg-elevated': '#1A1D26',
          'text-primary': '#F2F0E8',
          'text-secondary': '#9B9890',
          'text-muted': '#5C5A54',
          'border-subtle': 'rgba(242,240,232,0.06)',
          'border-default': 'rgba(242,240,232,0.12)',
          'border-strong': 'rgba(201,168,76,0.30)',
          'border-gold': 'rgba(201,168,76,0.3)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0B0F 0%, #111318 50%, #1A1D26 100%)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)',
        'mesh-gold': 'radial-gradient(at 40% 20%, rgba(201,168,76,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(30,205,179,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(255,92,122,0.04) 0px, transparent 50%)',
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
        'gold': '0 0 30px rgba(201,168,76,0.25)',
        'gold-lg': '0 0 60px rgba(201,168,76,0.35)',
        'teal': '0 0 30px rgba(30,205,179,0.25)',
        'card': '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.5)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)',
        'elevated': '0 20px 60px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
