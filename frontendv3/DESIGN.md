# Frontend V3 Design System

> **Core Philosophy**: Clean, crisp, modern, simple, sleek design with breathing components. No generic AI-generated aesthetics. Unique personality without chaos.

![Design Reference](file:///C:/Users/EnRyuu/.gemini/antigravity/brain/c29f85b8-9d8f-4001-b445-c366feba4599/uploaded_image_1767798468650.png)

---

## 🎯 Design Principles

### 1. **NO Generic AI Slop**
- Avoid typical dashboard layouts everyone uses
- Find unique, lesser-used design patterns
- Give the website personality and character
- Stand out from the crowd

### 2. **Breathing Space**
- Components need room to breathe
- Generous padding and margins
- Not congested or cramped
- Clean whitespace usage

### 3. **Minimal Rounding**
- **Almost no rounded corners** on most elements
- Maximum `border-radius: 4px` (very subtle)
- Sharp, crisp edges for modern look
- Exception: Pills/badges can be fully rounded

### 4. **No Heavy Shadows**
- **No shadows by default**
- Subtle shadows only on hover (not blurred heavily)
- `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` max
- Shadows for depth, not decoration

### 5. **Simple Interactions**
- Hover effects: subtle shadow appears (card stays in place)
- **No transform/scale on hover**
- No complex animations
- Smooth, purposeful transitions

### 6. **Grid/Line Aesthetic** ⭐
- **Subtle lines everywhere** for structure
- Use 1px borders to separate and define elements
- Creates a grid-like, organized feel
- Borders on cards, sections, containers
- Horizontal separators between sections
- Vertical dividers between columns
- Light gray borders in light mode
- Dark gray borders in dark mode
- Lines give personality and structure without clutter

---

## 🎨 Color System

### Light Mode
```css
Background: Clean whites and very light grays
Primary Text: Near-black (#0a0a0a)
Secondary Text: Medium gray (#666666)
Borders: Very light gray (#e5e5e5)
Accent: Single brand color (to be defined)
```

### Dark Mode
```css
Background: True dark (#0a0a0a to #121212)
Primary Text: Off-white (#f5f5f5)
Secondary Text: Light gray (#a3a3a3)
Borders: Dark gray (#262626)
Accent: Same brand color, slightly adjusted for dark
```

### Key Rules
- **High contrast** for readability
- **Consistent** across light and dark
- **Minimal color palette** - don't overuse colors
- Colors have meaning (success, error, warning, info)

---

## 📐 Spacing System

### Scale (Tailwind-based)
```
xs:  4px   (gap-1)
sm:  8px   (gap-2)
md:  16px  (gap-4)
lg:  24px  (gap-6)
xl:  32px  (gap-8)
2xl: 48px  (gap-12)
3xl: 64px  (gap-16)
```

### Application
- **Section spacing**: 3xl to 2xl
- **Component spacing**: lg to xl
- **Element spacing**: md
- **Tight spacing**: sm to xs

---

## 🧱 Component Guidelines

### Cards

**Structure**
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

**Styling Rules**
- Border: 1px solid border color
- Border radius: 4px maximum
- Padding: 24px (p-6)
- Background: card background color
- **Default**: No shadow
- **Hover**: `shadow-sm` appears smoothly
- **No transform on hover**

**Example**
```css
.card {
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  background: hsl(var(--card));
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

---

### Buttons

**Variants**
- **Primary**: Filled with accent color
- **Secondary**: Outlined with border
- **Ghost**: No border, subtle hover background
- **Link**: Text only, underline on hover

**Styling Rules**
- Border radius: 4px
- Padding: 12px 24px (medium)
- Font weight: 500 (medium)
- **No heavy shadows**
- Hover: Slight opacity change or background shift
- Focus: 1px outline, not ring

**Example**
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
```

---

### Form Components

#### Input Fields
```tsx
<Input 
  type="text" 
  placeholder="Enter text..."
/>
```

**Styling Rules**
- Border: 1px solid border color
- Border radius: 4px
- Padding: 10px 12px
- Background: transparent or subtle background
- Focus: Border color change (no ring)
- **No shadows**

#### Textarea
```tsx
<Textarea 
  placeholder="Enter description..."
  rows={4}
/>
```

**Same rules as Input**
- Resize: vertical only
- Min height: 80px

#### Select/Dropdown
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**Styling Rules**
- Trigger: Same as Input
- Dropdown: 1px border, 4px radius
- Items: Hover with subtle background
- **No shadows on dropdown** (or very subtle)

---

### Tables

**Structure**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Styling Rules**
- Border: 1px on all cells
- Border collapse: collapse
- Header: Slightly darker background
- Row hover: Very subtle background change
- **No rounded corners on table**
- Padding: 12px 16px per cell

---

### Badges/Pills

**Exception to rounding rule**
- Border radius: 9999px (fully rounded)
- Padding: 4px 12px
- Font size: 12px
- Font weight: 500

**Variants**
- Default, Success, Warning, Error, Info
- Outlined or filled

---

## 🔲 Grid & Line Usage

### Philosophy
Subtle 1px borders create structure, definition, and a unique grid-like aesthetic throughout the app. Lines separate elements, define boundaries, and give the interface personality without adding visual weight.

### Where to Use Lines

#### 1. **Card Borders**
All cards have 1px borders by default - this is already built in.

#### 2. **Section Separators**
```tsx
<Separator /> {/* 1px horizontal line */}
```
Use between major sections to create visual breaks.

#### 3. **Table Borders**
```tsx
<Table className="border">
  {/* Full grid on tables */}
</Table>
```
Tables should have borders on all cells for clear data structure.

#### 4. **Container Borders**
```tsx
<div className="border border-border rounded p-6">
  {/* Content */}
</div>
```
Wrap sections in bordered containers for definition.

#### 5. **Vertical Dividers**
```tsx
<div className="flex gap-6">
  <div>Left content</div>
  <Separator orientation="vertical" className="h-full" />
  <div>Right content</div>
</div>
```
Separate columns or sidebar from main content.

#### 6. **Header/Footer Borders**
```tsx
<header className="border-b border-border">
  {/* Navigation */}
</header>

<footer className="border-t border-border">
  {/* Footer content */}
</footer>
```

#### 7. **List Item Separators**
```tsx
<ul>
  <li className="border-b border-border py-4">Item 1</li>
  <li className="border-b border-border py-4">Item 2</li>
  <li className="py-4">Item 3</li> {/* Last item no border */}
</ul>
```

### Grid Patterns

#### Bento Grid Layout
```tsx
<div className="grid grid-cols-3 gap-px bg-border p-px rounded">
  <div className="bg-background p-6">Cell 1</div>
  <div className="bg-background p-6">Cell 2</div>
  <div className="bg-background p-6">Cell 3</div>
</div>
```
Creates a grid with 1px gaps that look like borders.

#### Dashboard Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>Stat 1</Card>
  <Card>Stat 2</Card>
  <Card>Stat 3</Card>
  <Card>Stat 4</Card>
</div>
```
Cards already have borders, creating a natural grid feel.

### Border Colors

Use `border-border` class for automatic theme switching:
- **Light Mode**: Very light gray (hsl(0 0% 90%))
- **Dark Mode**: Dark gray (hsl(0 0% 15%))

### Best Practices

✅ **Do**
- Use borders to define sections
- Create grid layouts with borders
- Add separators between list items
- Border cards and containers
- Use vertical dividers for columns
- Keep borders 1px thick
- Use consistent border colors

❌ **Don't**
- Overuse borders (not every element needs one)
- Use thick borders (always 1px)
- Mix border styles (stay consistent)
- Forget borders are part of the design language

---

## 🎭 Unique Design Elements

### Inspired by Reference Image

1. **Bold Typography**
   - Large, impactful headings
   - Mix of font weights
   - Generous line height

2. **Grid Layouts**
   - Clean grid systems
   - Asymmetric layouts (not always centered)
   - Bento-box style sections

3. **Minimal Icons**
   - Use sparingly
   - Line icons, not filled
   - Consistent stroke width

4. **Data Visualization**
   - Clean charts with minimal decoration
   - No 3D effects
   - Subtle grid lines
   - Clear labels

5. **Section Dividers**
   - Thin horizontal lines
   - Generous spacing around
   - Or use background color changes

---

## 📱 Responsive Design

### Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Approach
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44px)

---

## ✨ Animations & Transitions

### Allowed Animations
- Opacity changes
- Color transitions
- Shadow appearance
- Subtle slides (max 4px)

### Forbidden
- Scale transforms on hover
- Rotate effects
- Heavy blur effects
- Bounce animations

### Timing
```css
transition: all 200ms ease;
```

---

## 🚫 What NOT to Do

❌ **Avoid These**
- Neumorphism
- Glassmorphism (unless very subtle)
- Heavy gradients
- Drop shadows everywhere
- Rounded corners on everything
- Transform scale on hover
- Generic dashboard layouts
- Overuse of colors
- Cluttered spacing
- Tiny text

---

## ✅ What TO Do

✅ **Embrace These**
- Clean lines and borders everywhere
- Grid/line aesthetic for structure
- Generous whitespace
- High contrast text
- Purposeful color usage
- Consistent spacing
- Subtle hover effects
- Unique layouts
- Breathing room
- Sharp, crisp edges
- Personality in design

---

## 🎨 Component Checklist

Before creating any component, ask:

1. ✅ Does it have breathing space?
2. ✅ Are borders sharp (max 4px radius)?
3. ✅ Is shadow usage minimal?
4. ✅ Does hover add shadow, not transform?
5. ✅ Is it unique, not generic?
6. ✅ Does it work in light AND dark mode?
7. ✅ Is spacing consistent?
8. ✅ Is it clean and crisp?
9. ✅ Are borders used for structure and definition?

---

## 📝 Notes

- This is a living document
- Update as design evolves
- Always refer back when creating components
- Consistency is key
- Unique ≠ Chaotic

**Last Updated**: 2026-01-07
