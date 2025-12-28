# Compliance Agent - Frontend V2

A modern, premium frontend application for the Compliance Agent platform, built with React, TypeScript, and a Vercel-inspired design system.

## 🎨 Design Philosophy

This application follows a **premium, minimal, and elegant** design approach inspired by Vercel's design language:

- **Clean & Modern**: Zinc color palette for a sophisticated look
- **Smooth Animations**: Framer Motion for elegant page transitions and micro-interactions
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive**: Mobile-first design that scales beautifully

## 🛠️ Tech Stack

### Core
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router DOM** - Client-side routing

### Styling
- **Tailwind CSS v4** - Utility-first CSS with modern features
- **CSS Variables** - Dynamic theming for dark/light modes
- **Framer Motion** - Production-ready animation library

### Data Management
- **Axios** - HTTP client with interceptors
- **@tanstack/react-query** - Server state management
- **@tanstack/react-table** - Headless table component (ready for use)

### Forms & Validation
- **react-hook-form** - Performant form management
- **zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolver for react-hook-form

### UI Components
- **lucide-react** - Beautiful, consistent icon library
- **clsx** + **tailwind-merge** - Intelligent class name merging

## 📁 Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components
│       ├── Button.tsx   # Premium button with variants
│       ├── Input.tsx    # Form input with validation
│       └── Card.tsx     # Card component system
├── lib/
│   ├── api.ts          # Axios client & API endpoints
│   ├── query.ts        # React Query configuration
│   └── utils.ts        # Utility functions (cn, etc.)
├── pages/
│   ├── Onboarding.tsx  # 5-step onboarding wizard
│   └── Projects.tsx    # Projects listing page
├── App.tsx             # Root component with routing
├── main.tsx            # Application entry point
└── global.css          # Global styles & theme variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 Features Implemented

### ✅ Onboarding Flow
- **Step 1**: Industry Selection (6 industry options)
- **Step 2**: Brand Information (name & guidelines)
- **Step 3**: Project Creation
- **Step 4**: Guideline Upload (PDF, DOCX, TXT, MD)
- **Step 5**: Rule Review & Modification

### ✅ Design System
- **Button Component**: 5 variants (default, secondary, outline, ghost, destructive)
- **Input Component**: With label, error states, and validation
- **Card Component**: Modular card system with header, content, footer
- **Animations**: Fade-in, slide-in, scale-in with Framer Motion
- **Theme**: Automatic dark/light mode with Zinc palette

### ✅ API Integration
- Axios client with request/response interceptors
- User ID injection for authentication
- Error handling and retry logic
- React Query for caching and state management

## 🎨 Design Tokens

### Colors (Light Mode)
- **Background**: `#ffffff`
- **Foreground**: `#09090b`
- **Primary**: `#18181b`
- **Border**: `#e4e4e7`
- **Muted**: `#f4f4f5`

### Colors (Dark Mode)
- **Background**: `#09090b`
- **Foreground**: `#fafafa`
- **Primary**: `#fafafa`
- **Border**: `#27272a`
- **Muted**: `#27272a`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Animations
- **Duration**: 200-400ms
- **Easing**: ease-out
- **Types**: fade-in, slide-in, scale-in

## 📋 Best Practices

### Code Organization
- **Feature-based structure** for scalability
- **Atomic design** for UI components
- **Separation of concerns** (API, UI, logic)

### Performance
- **Code splitting** with React.lazy (ready for implementation)
- **React Query caching** (5min stale time, 10min gc time)
- **Optimized re-renders** with React.memo where needed

### Type Safety
- **Strict TypeScript** configuration
- **Zod schemas** for runtime validation
- **API response types** for type-safe data fetching

### Accessibility
- **Semantic HTML** throughout
- **ARIA labels** on interactive elements
- **Keyboard navigation** support
- **Focus management** with visible focus rings

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start dev server (http://localhost:5173)

# Build
pnpm build        # Type-check and build for production

# Linting
pnpm lint         # Run ESLint

# Preview
pnpm preview      # Preview production build locally
```

## 🎯 Next Steps

### Planned Features
- [ ] Project detail page with submissions
- [ ] Submission upload and analysis
- [ ] TanStack Table implementation for data grids
- [ ] Advanced filtering and search
- [ ] Real-time updates with WebSockets
- [ ] Export functionality (PDF, CSV)
- [ ] User authentication & authorization
- [ ] Admin dashboard

### UI Components to Build
- [ ] Table component (TanStack Table wrapper)
- [ ] Modal/Dialog component
- [ ] Toast notifications
- [ ] Dropdown/Select component
- [ ] Tabs component
- [ ] Badge component
- [ ] Skeleton loaders

## 🤝 Contributing

### Code Style
- Use **functional components** with hooks
- Prefer **named exports** for components
- Use **TypeScript interfaces** for props
- Follow **Prettier** formatting (auto-format on save)

### Component Guidelines
1. Use `cn()` utility for className merging
2. Forward refs for form components
3. Include proper TypeScript types
4. Add JSDoc comments for complex logic
5. Use Framer Motion for animations

## 📝 Notes

- **Tailwind v4**: Using new `@theme` directive (lint warnings are expected)
- **React Query**: Configured with sensible defaults for caching
- **Axios**: Interceptors handle user ID injection automatically
- **Dark Mode**: Automatic based on system preference (no toggle yet)

## 🐛 Known Issues

- CSS linter shows warnings for Tailwind v4 directives (`@theme`, `@apply`) - these are expected and can be ignored
- Dark mode toggle not implemented yet (uses system preference)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)

---

**Built with ❤️ for modern compliance management**
