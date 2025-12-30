# FrontendV2 Design System

## Overview
This design system follows a **Vercel-like** aesthetic: clean, modern, minimal, and unique. The design emphasizes clarity, subtle interactions, and a professional appearance with carefully chosen pastel accent colors.

---

## Color System

### Base Colors (Zinc Palette)
The application uses a **zinc-based** color palette for neutrals, providing a sophisticated and modern foundation:

#### Light Mode
- **Background**: `#ffffff` (Pure white)
- **Foreground**: `#09090b` (Near black - zinc-950)
- **Card**: `#ffffff` (White cards)
- **Border**: `#e4e4e7` (zinc-200)
- **Muted**: `#f4f4f5` (zinc-100)
- **Muted Foreground**: `#71717a` (zinc-500)

#### Dark Mode (Default)
- **Background**: `#09090b` (zinc-950)
- **Foreground**: `#fafafa` (zinc-50)
- **Card**: `#18181b` (zinc-900)
- **Border**: `#27272a` (zinc-800)
- **Muted**: `#27272a` (zinc-800)
- **Muted Foreground**: `#a1a1aa` (zinc-400)

### Accent Colors (Pastel-like, Distinct but Not Bright)
Accent colors are used sparingly for interactive elements, status indicators, and visual hierarchy:

- **Primary/Interactive**: `#fafafa` (Light mode) / `#18181b` (Dark mode)
- **Blue** (Links, Info): `#3b82f6` (blue-500) - Used for primary actions
- **Indigo** (Analytics): `#6366f1` (indigo-500) - Dashboard KPIs
- **Emerald** (Success): `#10b981` (emerald-500) - Positive states
- **Amber** (Warning): `#f59e0b` (amber-500) - Warnings
- **Red** (Error/Destructive): `#ef4444` (red-500) - Errors, delete actions
- **Purple** (Special): `#a855f7` (purple-500) - Special features
- **Teal** (Secondary): `#14b8a6` (teal-500) - Secondary accents

### Semantic Colors
- **Success**: `#22c55e` (green-500)
- **Warning**: `#f59e0b` (amber-500)
- **Info**: `#3b82f6` (blue-500)
- **Destructive**: `#ef4444` (red-500)

### Background Colors (Solid, Clean)
Use subtle solid backgrounds with low opacity for visual hierarchy:
- **Indigo Background**: `bg-indigo-500/5` or `bg-indigo-50` (light), `bg-indigo-950/20` (dark)
- **Emerald Background**: `bg-emerald-500/5` or `bg-emerald-50` (light), `bg-emerald-950/20` (dark)
- **Blue Background**: `bg-blue-500/5` or `bg-blue-50` (light), `bg-blue-950/20` (dark)
- **Amber Background**: `bg-amber-500/5` or `bg-amber-50` (light), `bg-amber-950/20` (dark)

> **Important**: **NO GRADIENTS**. The design uses clean, solid colors only. Gradients look dated and don't fit the modern minimal aesthetic.

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes & Weights
- **Headings**:
  - `h1`: `text-4xl` (36px), `font-bold` (700)
  - `h2`: `text-2xl` (24px), `font-semibold` (600)
  - `h3`: `text-xl` (20px), `font-semibold` (600)
  - `h4`: `text-lg` (18px), `font-medium` (500)

- **Body**:
  - Default: `text-base` (16px), `font-normal` (400)
  - Small: `text-sm` (14px)
  - Extra Small: `text-xs` (12px)

- **Emphasis**:
  - Semibold: `font-semibold` (600)
  - Medium: `font-medium` (500)

---

## Spacing & Layout

### Container Widths
- **Max Width**: `max-w-5xl` (1024px) for main content
- **Dashboard**: `max-w-[1400px]` for wide layouts
- **Onboarding**: `max-w-4xl` for focused flows

### Padding & Margins
- **Page Padding**: `p-6` (24px)
- **Card Padding**: `p-6` (24px) for header/content
- **Section Spacing**: `space-y-6` (24px vertical gap)
- **Component Gaps**: `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)

### Grid Layouts
- **Projects Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Dashboard KPIs**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Two-Column Forms**: `grid-cols-1 md:grid-cols-2`

---

## Border Radius

### Hierarchy
- **Small**: `rounded-lg` (0.5rem / 8px) - Buttons, inputs
- **Medium**: `rounded-xl` (0.75rem / 12px) - Cards
- **Large**: `rounded-2xl` (1rem / 16px) - Major containers
- **Full**: `rounded-full` - Badges, avatars, icons

---

## Shadows

### Elevation Levels
- **Small**: `shadow-sm` - Subtle depth
- **Medium**: `shadow-md` - Default cards
- **Large**: `shadow-lg` - Elevated cards
- **Extra Large**: `shadow-xl` - Modals, popovers

### Hover States
Cards use `hover:shadow-lg` for interactive feedback.

---

## Components

### Buttons

#### Variants
1. **Default** (Primary):
   - Background: `bg-primary` (zinc-950 in light, zinc-50 in dark)
   - Text: `text-primary-foreground`
   - Hover: `hover:bg-primary/90`
   - Active: `active:scale-[0.98]`

2. **Secondary**:
   - Background: `bg-secondary` (zinc-100 in light, zinc-800 in dark)
   - Hover: `hover:bg-secondary/80`

3. **Outline**:
   - Border: `border border-input`
   - Background: `bg-background`
   - Hover: `hover:bg-accent`

4. **Ghost**:
   - Transparent background
   - Hover: `hover:bg-accent`

5. **Destructive**:
   - Background: `bg-destructive` (red-500)
   - Text: `text-destructive-foreground`

#### Sizes
- **Small**: `h-9 px-3 text-sm`
- **Medium**: `h-10 px-4 py-2` (default)
- **Large**: `h-11 px-8 text-base`

#### Loading State
Shows spinner icon with `animate-spin`

### Cards

#### Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Styling
- Border: `border border-border`
- Background: `bg-card`
- Radius: `rounded-xl`
- Shadow: `shadow-sm`
- Hover: `hover:shadow-md`
- Transition: `transition-all duration-200`

#### Special Cards
- **Dashed Border** (Create New): `border-2 border-dashed hover:border-blue-500`
- **Colored Backgrounds**: Use solid color backgrounds with low opacity (e.g., `bg-indigo-500/5`)

### Inputs

#### Text Input
- Border: `border-2 border-input`
- Radius: `rounded-lg`
- Padding: `px-4 py-3`
- Focus: `focus:border-ring focus:ring-2 focus:ring-ring/20`
- Background: `bg-background`

#### Textarea
Same styling as text input with `resize-none`

#### File Upload
- Dashed border: `border-2 border-dashed border-border`
- Hover: `hover:border-foreground/50`
- Accepted state: Different styling (e.g., green border)

### Badges

#### Styling
- Padding: `px-2.5 py-1`
- Font: `text-xs font-medium`
- Radius: `rounded-md` or `rounded-full`
- Background: Color with `/10` opacity
- Border: `border border-{color}-500/20`

#### Category Badges
- **IRDAI**: `bg-purple-500/10 text-purple-600 border-purple-500/20`
- **Brand**: `bg-emerald-500/10 text-emerald-600 border-emerald-500/20`
- **SEO**: `bg-blue-500/10 text-blue-600 border-blue-500/20`
- **Qualitative**: `bg-amber-500/10 text-amber-600 border-amber-500/20`

#### Severity Badges
- **Critical**: `bg-red-500/10 text-red-600 border-red-500/20`
- **High**: `bg-orange-500/10 text-orange-600 border-orange-500/20`
- **Medium**: `bg-yellow-500/10 text-yellow-600 border-yellow-500/20`
- **Low**: `bg-blue-500/10 text-blue-600 border-blue-500/20`

---

## Animations

### Framer Motion Patterns

#### Page Entry
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

#### Card Hover
```tsx
whileHover={{ y: -4 }}
transition={{ duration: 0.2 }}
```

#### Step Transitions
```tsx
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.3 }}
```

#### Scale on Active
```tsx
whileTap={{ scale: 0.98 }}
```

### CSS Animations
- **Fade In**: `animate-fade-in` (0.3s)
- **Slide In Bottom**: `animate-slide-in-bottom` (0.4s)
- **Slide In Top**: `animate-slide-in-top` (0.4s)
- **Scale In**: `animate-scale-in` (0.2s)
- **Spin**: `animate-spin` (for loaders)

---

## Icons

### Library
Using **Lucide React** for consistent, modern iconography.

### Common Icons
- **Navigation**: `Folder`, `Plus`, `Search`, `Calendar`
- **Actions**: `Upload`, `Trash2`, `CheckCircle`, `ArrowRight`, `ArrowLeft`
- **Status**: `AlertCircle`, `Clock`, `TrendingUp`, `Activity`
- **Features**: `Sparkles`, `BrainCircuit`, `Target`, `Building2`

### Icon Sizing
- Small: `w-4 h-4`
- Medium: `w-5 h-5`
- Large: `w-6 h-6`
- Extra Large: `w-8 h-8`

---

## Interaction Patterns

### Hover States
- **Cards**: Subtle shadow increase + border color change
- **Buttons**: Background opacity change + scale down on active
- **Links**: Color change to blue-500

### Focus States
- Ring: `focus:ring-2 ring-ring ring-offset-2`
- Outline: `focus-visible:outline-none`

### Loading States
- Spinner with `animate-spin`
- Disabled state: `disabled:opacity-50 disabled:pointer-events-none`

### Transitions
- Default: `transition-all duration-200`
- Smooth: `transition-colors` or `transition-shadow`

---

## Layout Patterns

### Sidebar + Main Content
```tsx
<div className="flex min-h-[calc(100vh-108px)]">
  <div className="w-80 border-r border-zinc-800 p-6">
    {/* Sidebar */}
  </div>
  <div className="flex-1 p-6">
    {/* Main Content */}
  </div>
</div>
```

### Centered Container
```tsx
<div className="max-w-5xl mx-auto">
  {/* Content */}
</div>
```

### Full-Width Background
```tsx
<div className="min-h-screen bg-background p-6">
  {/* Content */}
</div>
```

---

## Best Practices

### Do's ✅
- Use zinc palette for neutrals
- Use **solid colors only** - no gradients
- Apply subtle backgrounds with low opacity (e.g., `bg-indigo-500/5`)
- Maintain consistent spacing (multiples of 4px/0.25rem)
- Use Framer Motion for smooth transitions
- Keep borders subtle with `border-border`
- Use semantic color names (success, warning, destructive)
- Keep colors clean, defined, and minimal but bright enough to get attention

### Don'ts ❌
- **NO GRADIENTS** - they look dated and old-school
- Avoid bright, saturated colors (use pastel/muted versions)
- Don't mix different neutral palettes (stick to zinc)
- Avoid harsh shadows (keep them subtle)
- Don't use multiple font families
- Avoid abrupt transitions (always animate)

---

## Accessibility

### Focus Indicators
All interactive elements have visible focus rings using `focus-visible:ring-2`

### Color Contrast
- Foreground/background combinations meet WCAG AA standards
- Text on colored backgrounds uses sufficient contrast

### Semantic HTML
- Proper heading hierarchy
- Button elements for actions
- Form labels for inputs

---

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)
- **Wide**: `xl:` (≥ 1280px)

### Mobile-First Approach
Start with mobile layout, progressively enhance for larger screens.

---

## Example Component Compositions

### KPI Card (Dashboard)
```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
      <Users className="w-4 h-4 text-indigo-500" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">+12% from last month</p>
  </CardContent>
</Card>
```

### Project Card
```tsx
<Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500 transition-all">
  <CardHeader>
    <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
      <Folder className="w-5 h-5 text-blue-500" />
    </div>
    <CardTitle className="text-lg">Project Name</CardTitle>
    <CardDescription>Project description</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center text-xs text-zinc-500">
      <Calendar className="w-3 h-3 mr-1" />
      Created: Jan 1, 2024
    </div>
  </CardContent>
</Card>
```

---

## Summary

This design system creates a **professional, modern, and minimal** interface inspired by Vercel's design language. The key characteristics are:

1. **Zinc-based neutral palette** for sophistication
2. **Pastel/muted accent colors** (not bright) for visual interest
3. **Subtle animations** using Framer Motion
4. **Consistent spacing** and typography
5. **Clean, minimal aesthetic** with purposeful use of color
6. **Smooth interactions** and transitions throughout
