/**
 * ANTWRE — Centralized Brand Design System & Tokens
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Repository: https://github.com/Nik-2208/AntWire
 * Portfolio:  https://nik-portfolio-lime.vercel.app/
 * LinkedIn:   https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/
 *
 * Single Source of Truth for:
 * - Brand Typography, Colors, Radii, Shadows, and Spacing
 * - Authoritative Logo & Asset Registry
 * - Icon Conventions & Interaction Styles
 */

export const ANTWRE_BRAND = {
  name: 'ANTWIRE',
  tagline: 'Biologically Inspired Ant Intelligence & Colony Simulation',
  description: 'An extensible computational ant brain (~55,000 synthetic neurons), individual-ant runtime, multi-agent colony superorganism, and community platform.',
  version: '1.0.0',
  author: {
    name: 'Nikhilesh H. Chavda',
    github: 'https://github.com/Nik-2208',
    linkedin: 'https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/',
    portfolio: 'https://nik-portfolio-lime.vercel.app/',
    repository: 'https://github.com/Nik-2208/AntWire',
    keyboardShowcase: 'https://ant-brain-keyboard.vercel.app/',
  },
  assets: {
    logoPng: '/assets/brand/antwire_logo.png',
    faviconPng: '/favicon.png',
  },
  colors: {
    // Primary Cyber Neural (Cyan/Blue)
    neural: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
    // Biological Synapse / Gold Accent
    synapse: {
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      gold: '#f59e0b',
    },
    // Colony Ecology (Emerald)
    colony: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    // Cyber Dark Backgrounds
    surface: {
      bg: '#06080d',
      panel: '#0c1017',
      card: '#111622',
      cardHover: '#161d2c',
      header: '#0a0d14',
      border: '#1f2937',
      borderSubtle: '#151b26',
      borderFocus: '#06b6d4',
    },
    // State Feedback
    state: {
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#f43f5e',
      info: '#06b6d4',
      neutral: '#94a3b8',
    }
  },
  typography: {
    brand: 'Outfit, -apple-system, BlinkMacSystemFont, sans-serif',
    ui: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    telemetry: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  },
  iconRules: {
    defaultStroke: 2,
    defaultSize: 16,
    inheritColor: true,
  }
} as const;
