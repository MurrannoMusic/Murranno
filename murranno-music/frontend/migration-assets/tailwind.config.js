/**
 * NativeWind Tailwind Configuration
 * Pixel-perfect match with web Tailwind config
 * 
 * This configuration mirrors src/index.css and tailwind.config.ts
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    container: {
      center: true,
      padding: 32, // 2rem = 32px
      screens: {
        '2xl': 1400,
      },
    },
    extend: {
      colors: {
        // Core colors - matching CSS variables exactly
        border: 'rgb(30, 41, 59)', // hsl(217 32% 17%)
        input: 'rgb(30, 41, 59)',
        ring: 'rgb(124, 58, 237)', // hsl(263 70% 50%)
        background: 'rgb(8, 12, 21)', // hsl(222 84% 5%)
        foreground: 'rgb(248, 250, 252)', // hsl(210 40% 98%)
        
        // Primary - Modern Purple
        primary: {
          DEFAULT: 'rgb(124, 58, 237)', // hsl(263 70% 50%)
          foreground: 'rgb(248, 250, 252)',
          glow: 'rgb(156, 89, 255)', // hsl(263 85% 60%)
        },
        
        // Secondary - Dark Cards
        secondary: {
          DEFAULT: 'rgb(30, 41, 59)', // hsl(217 32% 17%)
          foreground: 'rgb(226, 232, 240)', // hsl(210 40% 90%)
        },
        
        // Muted
        muted: {
          DEFAULT: 'rgb(26, 36, 51)', // hsl(217 32% 15%)
          foreground: 'rgb(148, 163, 184)', // hsl(215 20% 65%)
        },
        
        // Accent - Bright Purple
        accent: {
          DEFAULT: 'rgb(139, 92, 246)', // hsl(262 83% 58%)
          foreground: 'rgb(248, 250, 252)',
        },
        
        // Card
        card: {
          DEFAULT: 'rgb(14, 21, 36)', // hsl(222 84% 8%)
          foreground: 'rgb(248, 250, 252)',
        },
        
        // Popover
        popover: {
          DEFAULT: 'rgb(14, 21, 36)',
          foreground: 'rgb(248, 250, 252)',
        },
        
        // Destructive
        destructive: {
          DEFAULT: 'rgb(127, 29, 29)', // hsl(0 62% 30%)
          foreground: 'rgb(248, 250, 252)',
        },
        
        // Status colors
        success: {
          DEFAULT: 'rgb(34, 197, 94)', // hsl(142 71% 45%)
          foreground: 'rgb(248, 250, 252)',
        },
        warning: {
          DEFAULT: 'rgb(245, 158, 11)', // hsl(38 92% 50%)
          foreground: 'rgb(248, 250, 252)',
        },
        
        // Sidebar colors
        sidebar: {
          DEFAULT: 'rgb(10, 15, 26)', // hsl(222 84% 6%)
          foreground: 'rgb(248, 250, 252)',
          primary: 'rgb(124, 58, 237)',
          'primary-foreground': 'rgb(248, 250, 252)',
          accent: 'rgb(30, 41, 59)',
          'accent-foreground': 'rgb(226, 232, 240)',
          border: 'rgb(30, 41, 59)',
          ring: 'rgb(124, 58, 237)',
        },
      },
      
      // Border radius - converted from rem to px
      borderRadius: {
        none: 0,
        sm: 8, // calc(1.5rem - 4px) ≈ 20px, but using 8 for small
        md: 12, // calc(1.5rem - 2px) ≈ 22px, but using 12 for medium  
        DEFAULT: 16,
        lg: 24, // 1.5rem = 24px (--radius)
        xl: 28,
        '2xl': 32,
        '3xl': 48,
        full: 9999,
      },
      
      // Font family
      fontFamily: {
        sans: ['SF Pro Display', 'System'],
      },
      
      // Font sizes - matching web exactly
      fontSize: {
        xs: [12, { lineHeight: '16px' }],
        sm: [14, { lineHeight: '20px' }],
        base: [16, { lineHeight: '24px' }],
        lg: [18, { lineHeight: '28px' }],
        xl: [20, { lineHeight: '28px' }],
        '2xl': [24, { lineHeight: '32px' }],
        '3xl': [30, { lineHeight: '36px' }],
        '4xl': [36, { lineHeight: '40px' }],
        '5xl': [48, { lineHeight: '1' }],
      },
      
      // Spacing - matching Tailwind defaults
      spacing: {
        '0': 0,
        'px': 1,
        '0.5': 2,
        '1': 4,
        '1.5': 6,
        '2': 8,
        '2.5': 10,
        '3': 12,
        '3.5': 14,
        '4': 16,
        '5': 20,
        '6': 24,
        '7': 28,
        '8': 32,
        '9': 36,
        '10': 40,
        '11': 44,
        '12': 48,
        '14': 56,
        '16': 64,
        '20': 80,
        '24': 96,
        '28': 112,
        '32': 128,
        '36': 144,
        '40': 160,
        '44': 176,
        '48': 192,
        '52': 208,
        '56': 224,
        '60': 240,
        '64': 256,
        '72': 288,
        '80': 320,
        '96': 384,
      },
      
      // Opacity values for color modifiers
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
    },
  },
  plugins: [],
};
