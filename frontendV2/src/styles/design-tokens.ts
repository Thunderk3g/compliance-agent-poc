
// Design tokens mapped to the CSS variables defined in index.css
// These are useful for libraries that need JS values, like ApexCharts

export const colors = {
  primary: {
    DEFAULT: '#4F46E5', // Sphere Blue
    hover: '#4338CA',
    foreground: '#FFFFFF',
  },
  background: {
    DEFAULT: '#F8FAFC', // Slate-50
    paper: '#FFFFFF',
    dark: '#0F172A',
  },
  text: {
    main: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
  sphere: {
    blue600: '#4F46E5',
    blue700: '#4338CA',
    slate900: '#0F172A',
    slate50: '#F8FAFC',
  },
  chart: {
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  }
} as const;

export const fonts = {
  sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;
