# Compliance Agent Design System (Frontend V2)

This design system adapts the "Sphere" aesthetic for the Compliance Agent application, utilizing the specified tech stack: **React, Tailwind CSS, TanStack Query, TanStack Table, ApexCharts, Zod, Zustand, and Lucide React.**

## 1. Design Tokens (Tailwind Configuration)

To achieve the premium Sphere look, we will extend the Tailwind configuration.

### Colors
We will use a semantic color naming convention mapped to the specific hex values observed.

```javascript
// tailwind.config.js excerpt
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Sphere Blue (Indigo-600)
          hover: '#4338CA',   // Indigo-700
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#F8FAFC', // Slate-50
          paper: '#FFFFFF',
          dark: '#0F172A',    // Slate-900 (Sidebar/Footer)
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1', // Border colors
        },
        text: {
          main: '#0F172A',    // Slate-900
          secondary: '#64748B', // Slate-500
          muted: '#94A3B8',   // Slate-400
        },
        // Semantic for Compliance
        success: '#10B981', // Emerald-500
        warning: '#F59E0B', // Amber-500
        danger: '#EF4444',  // Red-500
        info: '#3B82F6',    // Blue-500
      }
    }
  }
}
```

### Typography
- **Font Family:** `Inter` (Google Fonts).
- **Headings:**
  - `h1`: `text-4xl font-extrabold tracking-tight text-text-main`
  - `h2`: `text-3xl font-bold tracking-tight text-text-main`
  - `h3`: `text-xl font-semibold text-text-main`
- **Body:**
  - `body-lg`: `text-lg text-text-secondary`
  - `body`: `text-base text-text-main`
  - `caption`: `text-sm font-medium text-text-muted`

### Shadows & Radius
- **Cards:** `shadow-lg` (shadow-slate-200/50), `rounded-2xl`, `bg-background-paper`.
- **Buttons:** `rounded-lg`, `shadow-md` (for primary).

## 2. Component Guidelines

### Layout Structure
The application will use a **Dashboard Layout** pattern.
- **Sidebar (Navigation):** Dark background (`bg-background-dark`). White text. Lucide icons.
- **Header (Top Bar):** White background (`bg-background-paper`). Sticky. Light border bottom.
- **Main Content:** Light grey background (`bg-background`). Generous padding (`p-6` or `p-8`).

### Buttons
- **Primary:** `bg-primary text-white hover:bg-primary-hover shadow-md px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]`.
- **Secondary:** `bg-white text-text-main border border-surface-200 hover:bg-surface-50 shadow-sm px-6 py-2.5 rounded-lg font-medium`.
- **Destructive:** `bg-danger text-white hover:bg-danger/90`.

### Data Visualization (ApexCharts)
Charts should mimic the clean, minimal aesthetic.
- **Colors:** Use the `primary`, `success`, `warning`, `danger` palette.
- **Grid:** Minimal or hidden grid lines (`strokeDashArray: 4`, `borderColor: '#e2e8f0'`).
- **Tooltip:** Clean custom HTML tooltip with shadow and rounded corners.
- **Legend:** Bottom or top aligned, usually simple dots.

### Data Tables (TanStack Table)
- **Header:** `bg-surface-50 text-text-secondary text-xs font-semibold uppercase tracking-wider border-b border-surface-200`.
- **Row:** `bg-white hover:bg-surface-50 border-b border-surface-100 transition-colors`.
- **Cell:** `px-6 py-4 whitespace-nowrap text-sm text-text-main`.
- **Pagination:** Simple "Previous" / "Next" buttons with page numbers, styled as Secondary Buttons (small).

### Forms (Zod + React Hook Form)
- **Input:** `block w-full rounded-lg border-surface-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5`.
- **Label:** `block text-sm font-medium text-text-main mb-1.5`.
- **Error:** `text-sm text-danger mt-1`.

## 3. Implementation Stack Details

- **Axios:** Configure a global client with interceptors for auth tokens and standardized error handling.
- **TanStack Query:** Use `useQuery` for fetching. Configure default `staleTime` (e.g., 5 mins) for dashboard data to reduce load. Use `useMutation` for form submissions.
- **Zustand:** Use for global client state (e.g., `useSidebarStore`, `useUserStore`) but rely on React Query for server state.
- **Lucide:** Use consistent icon sizes (usually `w-5 h-5` or `w-4 h-4` for dense UIs). Stroke width `1.5` or `2` depending on weight needed.

## 4. Visual "Sphere" Touches
- **Glassmorphism (Subtle):** Use `backdrop-blur-md bg-white/80` for sticky headers or floating panels.
- **Gradients (Accents):** Use a subtle radial gradient background on the main dashboard container if appropriate, but keep it very faint to maintain readability suitable for a data-heavy app.
- **Transitions:** All interactive elements must have `transition-all duration-200 ease-in-out`.
