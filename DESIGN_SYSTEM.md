# Design System Documentation

## Overview
This website uses **shadcn/ui** components built on top of **Radix UI** primitives, styled with **Tailwind CSS**. The design system follows a semantic color token approach with CSS variables for seamless light/dark mode support.

---

## Color System

### Light Mode Colors
| Token | HSL Values | Hex Equivalent | Usage |
|-------|------------|----------------|-------|
| `--background` | `45 35% 89%` | `#ECE7DA` | Main background (warm beige) |
| `--foreground` | `222.2 84% 4.9%` | `#222222` | Primary text color |
| `--primary` | `0 0% 13%` | `#222222` | Primary actions, buttons |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text on primary backgrounds |
| `--secondary` | `0 0% 93%` | `#EEEEEE` | Secondary backgrounds |
| `--secondary-foreground` | `0 0% 13%` | `#222222` | Text on secondary backgrounds |
| `--muted` | `0 0% 0%` | `#000000` | Muted backgrounds (underlines) |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Muted text |
| `--accent` | `0 0% 93%` | `#EEEEEE` | Accent backgrounds |
| `--accent-foreground` | `0 0% 13%` | `#222222` | Text on accent backgrounds |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` | Error states, destructive actions |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive backgrounds |
| `--border` | `0 0% 93%` | `#EEEEEE` | Borders, dividers |
| `--input` | `0 0% 93%` | `#EEEEEE` | Input borders |
| `--ring` | `0 0% 13%` | `#222222` | Focus rings |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `0 0% 13%` | `#222222` | Text on cards |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popover backgrounds |
| `--popover-foreground` | `0 0% 13%` | `#222222` | Text on popovers |

### Dark Mode Colors
| Token | HSL Values | Hex Equivalent | Usage |
|-------|------------|----------------|-------|
| `--background` | `120 2% 12%` | `#1E1F1E` | Main background (dark green-gray) |
| `--foreground` | `0 0% 93%` | `#EEEEEE` | Primary text color |
| `--primary` | `0 0% 93%` | `#EEEEEE` | Primary actions, buttons |
| `--primary-foreground` | `0 0% 13%` | `#222222` | Text on primary backgrounds |
| `--secondary` | `0 0% 25%` | `#404040` | Secondary backgrounds |
| `--secondary-foreground` | `0 0% 93%` | `#EEEEEE` | Text on secondary backgrounds |
| `--muted` | `0 0% 25%` | `#404040` | Muted backgrounds |
| `--muted-foreground` | `0 0% 60%` | `#999999` | Muted text |
| `--accent` | `0 0% 25%` | `#404040` | Accent backgrounds |
| `--accent-foreground` | `0 0% 93%` | `#EEEEEE` | Text on accent backgrounds |
| `--destructive` | `0 62.8% 30.6%` | `#7F1D1D` | Error states, destructive actions |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive backgrounds |
| `--border` | `0 0% 25%` | `#404040` | Borders, dividers |
| `--input` | `0 0% 25%` | `#404040` | Input borders |
| `--ring` | `0 0% 93%` | `#EEEEEE` | Focus rings |
| `--card` | `0 0% 20%` | `#333333` | Card backgrounds |
| `--card-foreground` | `0 0% 93%` | `#EEEEEE` | Text on cards |
| `--popover` | `0 0% 20%` | `#333333` | Popover backgrounds |
| `--popover-foreground` | `0 0% 93%` | `#EEEEEE` | Text on popovers |

### Using Colors in Code
```tsx
// Use Tailwind classes
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Click me</button>
</div>

// Or use CSS variables directly
<div style={{ backgroundColor: 'hsl(var(--background))' }}>
```

---

## Typography

### Font Families
- **Body Text**: System font stack
  ```css
  -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", 
  Roboto, "Helvetica Neue", Arial, sans-serif
  ```

- **Headings (h1-h6)**: System display font stack
  ```css
  -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", 
  Roboto, "Helvetica Neue", Arial, sans-serif
  ```
  - Font weight: `600` (semibold)
  - Uses `text-foreground` color

### Font Features
- `rlig` (required ligatures): enabled
- `calt` (contextual alternates): enabled

### Heading Styles
```tsx
// Use the heading utility class
<h2 className="heading">Section Title</h2>

// Or manually apply styles
<h2 className="text-foreground font-semibold tracking-tight">
  Section Title
</h2>
```

---

## Spacing & Layout

### Container
- **Max width**: `1280px` (2xl breakpoint: `1400px`)
- **Padding**: `2rem` (32px)
- **Centered**: Yes

### Standard Spacing Scale
Uses Tailwind's default spacing scale (4px base unit):
- `0`: 0px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px

---

## Border Radius

### Radius Values
- **Base radius**: `0.5rem` (8px) - defined as `--radius`
- **Large (lg)**: `var(--radius)` = `0.5rem` (8px)
- **Medium (md)**: `calc(var(--radius) - 2px)` = `6px`
- **Small (sm)**: `calc(var(--radius) - 4px)` = `4px`

### Usage
```tsx
<div className="rounded-lg">Large radius</div>
<div className="rounded-md">Medium radius</div>
<div className="rounded-sm">Small radius</div>
```

---

## Components

### Button
**Variants:**
- `default`: Primary button with solid background
- `destructive`: For destructive actions (red)
- `outline`: Outlined button
- `secondary`: Secondary button
- `ghost`: Ghost button (transparent background)
- `link`: Link-style button

**Sizes:**
- `default`: `h-10 px-4 py-2`
- `sm`: `h-9 px-3`
- `lg`: `h-11 px-8`
- `icon`: `h-10 w-10`

**Example:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">Click me</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="ghost">Ghost</Button>
```

### Card
**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content</CardContent>
</Card>
```

### Section Title
**Custom Component:**
```tsx
import SectionTitle from '@/components/common/SectionTitle';

<SectionTitle title="My Section" resumeLink="/resume.pdf" />
```

**Features:**
- Bottom border with `border-muted`
- Optional resume link button
- Responsive spacing

### Link Card
**Custom Component:**
```tsx
import LinkCard from '@/components/common/LinkCard';

<LinkCard 
  title="External Link"
  description="Description text"
  url="https://example.com"
/>
```

**Features:**
- Dashed left border
- Hover effects with border color change
- External link icon

---

## Shadows & Effects

### Paper Shadow
Material Design-inspired shadow with hover effect:
```css
.paper-shadow {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: box-shadow 0.4s cubic-bezier(.25,.8,.25,1);
}

.paper-shadow:hover {
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}
```

**Usage:**
```tsx
<div className="paper-shadow">Card with shadow</div>
```

### Dashed Border
```css
.dashed-border {
  border: 1px dashed hsl(var(--border));
  background-color: transparent;
  box-shadow: none;
}
```

---

## Animations & Transitions

### Keyframe Animations

#### Accordion
- `accordion-down`: Smooth height expansion
- `accordion-up`: Smooth height collapse
- Duration: `0.2s ease-out`

#### Fold Animations
- `fold-in`: Rotate from 0deg to -90deg with fade out
- `fold-out`: Rotate from -90deg to 0deg with fade in
- Duration: `0.5s ease-in-out`

#### Mode Toggle
- `mode-toggle`: Rotate 0deg → 45deg → 90deg
- Duration: `0.5s ease-in-out`

#### Paper Float
- `paper-float`: Vertical float animation (translateY)
- Duration: `3s ease-in-out infinite`

#### Smooth Return
- `smooth-return`: Smooth return to original position
- Duration: `0.5s ease-in-out`

### Transition Utilities

#### Color Transitions
- **Default**: All elements have `transition-colors duration-100`
- Applied globally to `*` selector

#### Hover Transitions
```css
.hover-transition {
  transition-property: all;
  transition-duration: 0.4s;
  transition-timing-function: ease-in-out;
}

.hover-float {
  transform: translateY(0);
  transition: transform 0.4s ease-in-out;
}

.hover-float:hover {
  transform: translateY(-5px);
}
```

### Custom Duration Values
- `450ms`: `transition-duration-450`
- `500ms`: `transition-duration-500`
- `600ms`: `transition-duration-600`

---

## Component Patterns

### Toggle Card
```css
.toggle-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-content {
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Utility Function: `cn()`
Merge class names with proper Tailwind conflict resolution:
```tsx
import { cn } from '@/lib/utils';

<div className={cn("base-class", condition && "conditional-class")} />
```

---

## Available UI Components

The project includes shadcn/ui components:
- Accordion
- Alert Dialog
- Aspect Ratio
- Avatar
- Badge
- Breadcrumb
- Button
- Calendar
- Card
- Carousel
- Chart
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Form
- Hover Card
- Input
- Input OTP
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Slider
- Sonner (Toast)
- Switch
- Table
- Tabs
- Textarea
- Toast
- Toaster
- Toggle
- Toggle Group
- Tooltip

All components are located in `src/components/ui/`.

---

## Custom Components

### Common Components
- `IconLink`: Icon with link
- `LinkCard`: Card-style link with description
- `SectionTitle`: Section heading with optional action
- `ThemeSlider`: Theme toggle slider
- `ThemeToggle`: Theme toggle button

### Custom Components
- `DotGrid`: Animated dot grid background
- `EyesOverlay`: Eye overlay effect
- `FunModeTransition`: Transition animation for fun mode
- `RoleCard`: Role/project card component
- `TiltedCard`: Card with tilt effect

### Layout Components
- `Footer`: Site footer
- `Header`: Site header with navigation

---

## Best Practices

### 1. Use Semantic Colors
Always use semantic color tokens instead of hardcoded colors:
```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Bad
<div className="bg-[#ECE7DA] text-[#222222]">
```

### 2. Use Utility Classes
Prefer Tailwind utility classes over custom CSS:
```tsx
// ✅ Good
<div className="flex items-center gap-4 p-6">

// ❌ Bad
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
```

### 3. Use `cn()` for Conditional Classes
```tsx
// ✅ Good
<div className={cn("base-class", isActive && "active-class")}>

// ❌ Bad
<div className={`base-class ${isActive ? "active-class" : ""}`}>
```

### 4. Respect Reduced Motion
Animations should respect user preferences:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animations */
}
```

### 5. Use Component Variants
When using shadcn/ui components, use their variant system:
```tsx
// ✅ Good
<Button variant="outline" size="sm">

// ❌ Bad
<Button className="border border-input bg-background hover:bg-accent h-9 px-3">
```

---

## Theme Switching

The project uses `next-themes` for theme management. Themes are toggled using the `ThemeToggle` or `ThemeSlider` components.

### Theme Provider
```tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {/* Your app */}
</ThemeProvider>
```

### Manual Theme Toggle
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
setTheme(theme === 'dark' ? 'light' : 'dark');
```

---

## Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (container max-width)

### Container
- Max width: `1280px`
- Padding: `2rem` (32px)
- Centered: Yes

---

## Accessibility

### Focus States
All interactive elements have visible focus states using the `--ring` color:
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### Color Contrast
- Light mode: Dark text (`#222222`) on light background (`#ECE7DA`)
- Dark mode: Light text (`#EEEEEE`) on dark background (`#1E1F1E`)
- Both modes meet WCAG AA contrast requirements

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic HTML elements (`<nav>`, `<main>`, `<footer>`, etc.)
- Provide alt text for images
- Use ARIA labels where appropriate

---

## Development Tools

### Class Name Utility
```tsx
import { cn } from '@/lib/utils';
```
Merges class names and resolves Tailwind conflicts.

### Component Variants
Use `class-variance-authority` (CVA) for component variants:
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ }
    }
  }
);
```

---

## File Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── custom/          # Custom-designed components
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── hooks/
│   └── useTheme.tsx     # Theme hook
└── index.css            # Global styles and CSS variables
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Next Themes Documentation](https://github.com/pacocoursey/next-themes)

---

## Version

**Design System Version**: 1.0.0
**Last Updated**: 2024
**Framework**: React + TypeScript + Tailwind CSS + shadcn/ui

