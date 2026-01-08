// Design System Configuration
// Easily change the accent color here
export const ACCENT_COLOR = "amber"; // Change to 'blue', 'violet', 'emerald', etc.

// Soft colors for better eye comfort
export const softColors = {
  // Soft black - not pure black (#000000)
  black: "#0a0a0a",

  // Cream white with subtle amber tint - not pure white (#ffffff)
  white: "#fefdfb",

  // Muted backgrounds
  background: {
    light: "#fefdfb",
    dark: "#0a0a0a",
  },

  // Subtle borders
  border: {
    light: "#e7e5e4", // stone-200
    dark: "#27272a", // zinc-800
  },
};

// Extended color system for compliance dashboard
export const dashboardColors = {
  // Success (Green) - works in light & dark
  success: {
    light: "#10b981", // emerald-500
    dark: "#34d399", // emerald-400
    bg: "#d1fae5", // emerald-100
    bgDark: "#064e3b", // emerald-900
    text: "#065f46", // emerald-800
    textDark: "#d1fae5", // emerald-100
  },

  // Warning (Orange) - works in light & dark
  warning: {
    light: "#f97316", // orange-500
    dark: "#fb923c", // orange-400
    bg: "#ffedd5", // orange-100
    bgDark: "#7c2d12", // orange-900
    text: "#9a3412", // orange-800
    textDark: "#ffedd5", // orange-100
  },

  // Error (Red) - works in light & dark
  error: {
    light: "#ef4444", // red-500
    dark: "#f87171", // red-400
    bg: "#fee2e2", // red-100
    bgDark: "#7f1d1d", // red-900
    text: "#991b1b", // red-800
    textDark: "#fee2e2", // red-100
  },

  // Category colors
  irdai: {
    light: "#3b82f6", // blue-500
    dark: "#60a5fa", // blue-400
    bg: "#dbeafe", // blue-100
  },

  brand: {
    light: "#8b5cf6", // violet-500
    dark: "#a78bfa", // violet-400
    bg: "#ede9fe", // violet-100
  },

  seo: {
    light: "#06b6d4", // cyan-500
    dark: "#22d3ee", // cyan-400
    bg: "#cffafe", // cyan-100
  },
};

// Helper to get status color
export const getStatusColor = (score: number, isDark = false) => {
  if (score >= 80)
    return isDark
      ? dashboardColors.success.dark
      : dashboardColors.success.light;
  if (score >= 60)
    return isDark
      ? dashboardColors.warning.dark
      : dashboardColors.warning.light;
  return isDark ? dashboardColors.error.dark : dashboardColors.error.light;
};

// Helper to get status background
export const getStatusBg = (score: number, isDark = false) => {
  if (score >= 80)
    return isDark ? dashboardColors.success.bgDark : dashboardColors.success.bg;
  if (score >= 60)
    return isDark ? dashboardColors.warning.bgDark : dashboardColors.warning.bg;
  return isDark ? dashboardColors.error.bgDark : dashboardColors.error.bg;
};
