# Navigation System

## Overview

Dynamic navigation system with three main components:

1. **LandingNavbar** - Minimal navbar for public pages
2. **AppNavbar** - Full navbar with breadcrumbs for authenticated pages  
3. **TabsNav** - Dynamic tabs that change based on context

---

## Components

### LandingNavbar

**Location**: `src/components/layout/LandingNavbar.tsx`

**Usage**: Public pages (landing, login)

**Features**:
- Logo + "Compliance Bot" text
- Sign In / Get Started buttons
- Theme toggle

**Example**:
```tsx
<LandingLayout>
  <Route path="/" element={<Landing />} />
</LandingLayout>
```

---

### AppNavbar

**Location**: `src/components/layout/AppNavbar.tsx`

**Usage**: Authenticated pages

**Structure**:
```
Logo | Compliance Bot | Team Name ▼ | > Projects | > Project Name ▼ | Theme Toggle | Avatar
```

**Features**:
- Logo + branding
- Team/user name dropdown
- Breadcrumb navigation
- Project selector (when in project context)
- Theme toggle
- User avatar

**Props**:
- `showProjectSelector?: boolean` - Show/hide project breadcrumbs

---

### TabsNav

**Location**: `src/components/layout/TabsNav.tsx`

**Usage**: Dynamic navigation tabs

**Props**:
```typescript
interface Tab {
  name: string;
  path: string;
}

interface TabsNavProps {
  tabs: Tab[];
}
```

**Example**:
```tsx
const tabs = [
  { name: 'Overview', path: '/projects/123/dashboard' },
  { name: 'Analyze', path: '/projects/123/analyze' },
];

<TabsNav tabs={tabs} />
```

---

## Layouts

### LandingLayout

**Usage**: Public pages

**Structure**:
```tsx
<LandingLayout>
  <LandingNavbar />
  <Outlet /> {/* Page content */}
</LandingLayout>
```

---

### AppLayout

**Usage**: Authenticated pages

**Structure**:
```tsx
<AppLayout>
  <AppNavbar showProjectSelector={isProjectContext} />
  <TabsNav tabs={dynamicTabs} />
  <Outlet /> {/* Page content */}
</AppLayout>
```

**Dynamic Tabs**:
- **Global context**: Projects, Results, Settings
- **Project context**: Overview, Analyze, Results, Rules, Settings

---

## Routes

### Public Routes (LandingLayout)
- `/` - Landing page
- `/login` - Login page

### Global Routes (AppLayout)
- `/projects` - All projects
- `/results` - All results
- `/settings` - Global settings

### Project Routes (AppLayout)
- `/projects/:id/dashboard` - Project overview
- `/projects/:id/analyze` - Analysis page
- `/projects/:id/results` - Project results
- `/projects/:id/rules` - Project rules
- `/projects/:id/settings` - Project settings

---

## Design System Compliance

✅ **Minimal rounding** - 4px max on all elements
✅ **Clean borders** - 1px borders for structure
✅ **No heavy shadows** - Subtle shadows on hover only
✅ **Breathing space** - Generous padding throughout
✅ **Theme support** - Full light/dark mode
✅ **Grid aesthetic** - Border separators between sections

---

## Testing

**Test Routes**:
1. `/` - Landing with minimal navbar
2. `/projects` - Global view with app navbar
3. `/projects/123/dashboard` - Project view with breadcrumbs

**Test Features**:
- Theme toggle works in all navbars
- Project selector shows all projects
- Breadcrumbs update correctly
- Tabs highlight active route
- Responsive on mobile

---

**Created**: 2026-01-07
