# Compliance Agent Frontend V3

A fresh, modern frontend for the Compliance Agent application built with React, TypeScript, Vite, and shadcn/ui components.

## 🚀 Tech Stack

- **Framework**: React 19.2.0 + TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **Routing**: React Router DOM 7.11
- **State Management**: TanStack Query 5.90 (React Query)
- **Forms**: React Hook Form 7.69 + Zod 4.2
- **Tables**: TanStack Table 8.21
- **HTTP Client**: Axios 1.13
- **Icons**: Lucide React
- **Animations**: Framer Motion 12.23

## 📁 Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts (User, Project, Theme)
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities (API client, React Query config)
├── pages/               # Page components
├── services/            # API service hooks (React Query)
├── types/               # TypeScript type definitions
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point
```

## 🎨 Features

- ✅ **Light/Dark Mode**: Built-in theme system with localStorage persistence
- ✅ **Type-Safe API**: Full TypeScript coverage with typed API responses
- ✅ **Modern UI**: shadcn/ui components with Tailwind CSS
- ✅ **Smart Caching**: React Query for efficient data fetching
- ✅ **Form Validation**: React Hook Form with Zod schemas
- ✅ **Path Aliases**: Clean imports with `@/` prefix

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
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

The app will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 🎯 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🎨 Theme System

The app includes a built-in light/dark mode system:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## 🔌 API Integration

All API calls are centralized in `src/lib/api.ts` and wrapped with React Query hooks in `src/services/`:

```tsx
import { useProjects } from '@/services/projects';

function ProjectsList() {
  const { data: projects, isLoading } = useProjects();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## 🧩 Adding shadcn/ui Components

This project uses shadcn/ui components. To add more components, manually create them in `src/components/ui/` following the shadcn/ui documentation.

## 📚 Next Steps

1. **Add More UI Components**: Create additional shadcn/ui components as needed
2. **Build Pages**: Migrate pages from frontendV2 with new designs
3. **Add Layouts**: Create layout components for consistent structure
4. **Implement Theme Toggle**: Add a UI component for theme switching
5. **Add More Features**: Implement remaining functionality

## 🤝 Contributing

This is a fresh start! Feel free to implement your custom designs and components.

## 📄 License

Private project for Thunderk3g
