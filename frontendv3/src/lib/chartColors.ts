// Chart color palette - easily changeable
export const chartColors = {
  // Primary colors from frontendV1
  primary: "#8b5cf6", // violet
  secondary: "#005dac", // blue
  success: "#10b981", // emerald/green
  warning: "#f59e0b", // amber
  danger: "#ef4444", // red
  info: "#2dd4bf", // teal

  // Gradient colors
  gradientStart: "#6366f1", // indigo
  gradientEnd: "#8b5cf6", // violet

  // Chart specific
  gauge: "#10b981", // emerald for gauge
  gaugeBg: "#e5e7eb", // gray for gauge background

  // Heatmap ranges
  heatmapLow: "#10b981", // green
  heatmapMedium: "#f59e0b", // amber
  heatmapHigh: "#ef4444", // red

  // Status colors
  passed: "#10b981", // green
  flagged: "#f59e0b", // amber
  failed: "#ef4444", // red
  pending: "#6b7280", // gray

  // Bar chart colors (distributed)
  bar1: "#8b5cf6", // violet
  bar2: "#005dac", // blue
  bar3: "#10b981", // green
  bar4: "#f59e0b", // amber
  bar5: "#ef4444", // red
};

// Export as array for easy iteration
export const barChartColors = [
  chartColors.bar1,
  chartColors.bar2,
  chartColors.bar3,
  chartColors.bar4,
  chartColors.bar5,
];
