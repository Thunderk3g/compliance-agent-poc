/**
 * Chart theme utilities for dark mode support
 */

// Detect if dark mode is active
export const isDarkMode = () => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

// Chart colors for dark mode
export const getChartTheme = () => {
  const dark = isDarkMode();

  return {
    // Text colors
    text: {
      primary: dark ? "#f5f5f5" : "#1f2937",
      secondary: dark ? "#a3a3a3" : "#6b7280",
      muted: dark ? "#737373" : "#9ca3af",
    },

    // Background colors
    background: {
      primary: dark ? "#0a0a0a" : "#fefdfb",
      secondary: dark ? "#171717" : "#f9fafb",
      card: dark ? "#1c1c1c" : "#ffffff",
    },

    // Border colors
    border: {
      primary: dark ? "#27272a" : "#e7e5e4",
      secondary: dark ? "#3f3f46" : "#d6d3d1",
    },

    // Grid colors
    grid: {
      line: dark ? "#27272a" : "#f3f4f6",
    },

    // Data colors (these stay consistent but may need opacity adjustments)
    data: {
      primary: "#3b82f6",
      success: dark ? "#34d399" : "#10b981",
      warning: dark ? "#fb923c" : "#f97316",
      error: dark ? "#f87171" : "#ef4444",
    },
  };
};

// ApexCharts theme configuration
export const getApexChartsTheme = () => {
  const dark = isDarkMode();

  return {
    mode: dark ? "dark" : "light",
    palette: "palette1",
    monochrome: {
      enabled: false,
    },
  };
};

// Common chart options for dark mode
export const getCommonChartOptions = () => {
  const theme = getChartTheme();

  return {
    chart: {
      background: theme.background.card,
      foreColor: theme.text.secondary,
    },
    grid: {
      borderColor: theme.grid.line,
    },
    xaxis: {
      axisBorder: {
        color: theme.border.primary,
      },
      axisTicks: {
        color: theme.border.primary,
      },
      labels: {
        style: {
          colors: theme.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.text.secondary,
        },
      },
    },
    title: {
      style: {
        color: theme.text.primary,
      },
    },
    legend: {
      labels: {
        colors: theme.text.secondary,
      },
    },
    tooltip: {
      theme: isDarkMode() ? "dark" : "light",
    },
  };
};
