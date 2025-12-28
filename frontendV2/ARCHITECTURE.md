# Frontend V2 Architecture & Requirements

## Overview
This document outlines the architecture, tech stack, and best practices for the Compliance Agent Frontend V2 - a premium, Vercel-inspired web application.

---

## 🎯 Core Requirements

### Design Philosophy
- **Premium & Modern**: Vercel-like aesthetic with clean lines and sophisticated color palette
- **Minimal but Elegant**: Subtle animations that enhance UX without being disruptive
- **Responsive**: Mobile-first approach with seamless adaptation across devices
- **Accessible**: WCAG 2.1 AA compliant with proper semantic HTML

### Color Scheme
- **Light Mode**: Zinc-based palette with white backgrounds
- **Dark Mode**: Deep blacks with zinc accents
- **Accent Colors**: Minimal use of color for status indicators (success, warning, error)
- **Consistency**: All colors defined as CSS variables for easy theming

---

## 🛠️ Technology Stack

### Frontend Framework
```
React 19.2.0
├── TypeScript (Strict mode enabled)
├── Vite 7.2.4 (Build tool)
└── React Router DOM (Client-side routing)
```

### Styling & Design
```
Tailwind CSS v4.1.18
├── @tailwindcss/vite (Vite integration)
├── CSS Variables (Theme tokens)
├── Inter Font Family (Google Fonts)
└── Framer Motion (Animations)
```

### State Management
```
@tanstack/react-query
├── Server state caching
├── Automatic refetching
├── Optimistic updates
└── Error handling
```

### Data Fetching
```
Axios
├── Request/Response interceptors
├── Automatic user ID injection
├── Error handling
└── TypeScript types
```

### Forms
```
react-hook-form
├── @hookform/resolvers (Zod integration)
├── Zod (Schema validation)
├── Performance optimized
└── TypeScript support
```

### Tables
```
@tanstack/react-table
├── Headless UI
├── Sorting, filtering, pagination
├── Virtual scrolling support
└── TypeScript support
```

### Icons & Utilities
```
lucide-react (Icons)
clsx (Conditional classes)
tailwind-merge (Class merging)
```

---

## 📁 Folder Structure

### Recommended Structure
```
src/
├── components/
│   ├── ui/                    # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── shared/                # Shared business components
│       ├── ProjectCard.tsx
│       ├── RulesList.tsx
│       └── ...
├── features/                  # Feature modules
│   ├── projects/
│   │   ├── api/              # API calls
│   │   ├── components/       # Feature-specific components
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── submissions/
│   └── compliance/
├── hooks/                     # Global custom hooks
│   ├── useTheme.ts
│   ├── useDebounce.ts
│   └── ...
├── lib/                       # Core utilities
│   ├── api.ts                # Axios client
│   ├── query.ts              # React Query config
│   └── utils.ts              # Helper functions
├── pages/                     # Route components
│   ├── Onboarding.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   └── ...
├── types/                     # Global TypeScript types
│   ├── api.ts
│   └── models.ts
├── styles/                    # Global styles
│   └── global.css
├── App.tsx                    # Root component
└── main.tsx                   # Entry point
```

---

## 🎨 Design System

### Color Palette (CSS Variables)

#### Light Mode
```css
--color-background: #ffffff
--color-foreground: #09090b
--color-primary: #18181b
--color-secondary: #f4f4f5
--color-muted: #f4f4f5
--color-border: #e4e4e7
--color-accent: #f4f4f5
```

#### Dark Mode
```css
--color-background: #09090b
--color-foreground: #fafafa
--color-primary: #fafafa
--color-secondary: #27272a
--color-muted: #27272a
--color-border: #27272a
--color-accent: #27272a
```

### Typography
- **Font**: Inter (300, 400, 500, 600, 700, 800)
- **Base Size**: 16px
- **Scale**: Tailwind default scale
- **Line Height**: 1.5 (body), 1.2 (headings)

### Spacing
- **Base Unit**: 4px (Tailwind default)
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

### Border Radius
- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)

### Shadows
- **sm**: Subtle elevation
- **md**: Card elevation
- **lg**: Modal elevation
- **xl**: Dropdown elevation

---

## 🎭 Animation Guidelines

### Principles
1. **Subtle**: Animations should enhance, not distract
2. **Fast**: Keep durations between 150-400ms
3. **Purposeful**: Every animation should have a reason
4. **Consistent**: Use same easing across similar interactions

### Types of Animations

#### Page Transitions (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
```

#### Hover Effects
- **Scale**: 1.02 for cards, 0.98 for buttons
- **Opacity**: 0.8 for subtle fade
- **Border**: Color transition for focus states

#### Loading States
- **Spinner**: Rotating circle for async operations
- **Skeleton**: Placeholder for content loading
- **Progress**: Linear progress for multi-step processes

---

## 🔧 Code Splitting

### Route-based Splitting
```tsx
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/projects/:id" element={<ProjectDetail />} />
</Suspense>
```

### Component-based Splitting
```tsx
const HeavyChart = lazy(() => import('./components/HeavyChart'));
```

---

## 🔄 API Integration

### Axios Configuration
```typescript
// Interceptors for authentication
apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  config.headers['X-User-Id'] = userId;
  return config;
});

// Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401, 403, 500, etc.
    return Promise.reject(error);
  }
);
```

### React Query Usage
```typescript
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: () => api.getProjects(),
});

// Mutation
const mutation = useMutation({
  mutationFn: api.createProject,
  onSuccess: () => {
    queryClient.invalidateQueries(['projects']);
  },
});
```

---

## 📝 Form Handling

### React Hook Form + Zod
```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

---

## 📊 Table Implementation

### TanStack Table Pattern
```typescript
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

---

## ♿ Accessibility Requirements

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators

### ARIA Labels
- Proper labeling for screen readers
- Role attributes where appropriate
- Live regions for dynamic content

### Semantic HTML
- Use proper heading hierarchy (h1 → h6)
- Use `<button>` for actions, `<a>` for navigation
- Use `<form>` for form submissions

---

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- Vitest for component testing
- React Testing Library for DOM testing
- Mock API calls with MSW

### E2E Tests (Recommended)
- Playwright for end-to-end testing
- Test critical user flows
- Visual regression testing

---

## 🚀 Performance Optimization

### Bundle Size
- Code splitting by route
- Tree shaking enabled
- Dynamic imports for heavy components

### Runtime Performance
- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for large lists

### Network
- React Query caching (5min stale time)
- Prefetching for predictable navigation
- Optimistic updates for better UX

---

## 📦 Build & Deployment

### Build Command
```bash
pnpm build
```

### Output
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── index.html
```

### Environment Variables
```env
VITE_API_BASE_URL=https://api.example.com
```

---

## 🎯 Best Practices

### Component Design
1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Use composition patterns
3. **Props Drilling**: Avoid deep prop drilling (use context if needed)
4. **TypeScript**: Always type props and state

### State Management
1. **Server State**: Use React Query
2. **UI State**: Use useState/useReducer
3. **Global State**: Use Context API or Zustand (if needed)
4. **Form State**: Use React Hook Form

### File Naming
- **Components**: PascalCase (e.g., `Button.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useDebounce.ts`)
- **Types**: PascalCase (e.g., `Project.ts`)

### Import Order
1. React imports
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles

---

## 📚 Additional Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [TanStack Query Guide](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)

---

**Last Updated**: 2025-12-27
**Version**: 1.0.0
