# Lexora Design System and Style Guide

## Design Principles

### 1. Consistency
- All components follow the same design patterns
- Consistent spacing, typography, and color usage
- Standardized interaction patterns across the platform

### 2. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios for all text

### 3. Performance
- Optimized for fast loading
- Minimal layout shifts
- Efficient animations and transitions

## Color System

### Primary Colors
```scss
$primary: (
  50: #eff6ff,
  100: #dbeafe,
  200: #bfdbfe,
  300: #93c5fd,
  400: #60a5fa,
  500: #3b82f6,  // Main primary
  600: #2563eb,
  700: #1d4ed8,
  800: #1e40af,
  900: #1e3a8a,
  950: #172554
);
```

### Accent Colors
```scss
$accent: (
  50: #fdf4ff,
  100: #fae8ff,
  200: #f5d0fe,
  300: #f0abfc,
  400: #e879f9,
  500: #d946ef,  // Main accent
  600: #c026d3,
  700: #a21caf,
  800: #86198f,
  900: #701a75,
  950: #4a044e
);
```

### Dark Theme Colors
```scss
$dark: (
  50: #f8f9fa,
  100: #f1f3f4,
  200: #e8eaed,
  300: #dadce0,
  400: #bdc1c6,
  500: #9aa0a6,
  600: #80868b,
  700: #5f6368,
  800: #3c4043,
  900: #202124,
  950: #0d1117   // Main dark background
);
```

### Semantic Colors
```scss
$semantic: (
  success: #22c55e,
  warning: #f59e0b,
  error: #ef4444,
  info: #3b82f6
);
```

## Typography Scale

### Font Family
```scss
$font-family: (
  sans: ('Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'),
  mono: ('JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace')
);
```

### Font Sizes and Line Heights
```scss
$typography: (
  h1: (
    font-size: 2.5rem,    // 40px
    line-height: 1.2,
    font-weight: 700,
    letter-spacing: -0.025em
  ),
  h2: (
    font-size: 2rem,      // 32px
    line-height: 1.3,
    font-weight: 600,
    letter-spacing: -0.025em
  ),
  h3: (
    font-size: 1.5rem,    // 24px
    line-height: 1.4,
    font-weight: 600,
    letter-spacing: -0.025em
  ),
  h4: (
    font-size: 1.25rem,   // 20px
    line-height: 1.4,
    font-weight: 500,
    letter-spacing: -0.025em
  ),
  body-lg: (
    font-size: 1.125rem,  // 18px
    line-height: 1.6,
    font-weight: 400
  ),
  body: (
    font-size: 1rem,      // 16px
    line-height: 1.6,
    font-weight: 400
  ),
  body-sm: (
    font-size: 0.875rem,  // 14px
    line-height: 1.5,
    font-weight: 400
  ),
  caption: (
    font-size: 0.75rem,   // 12px
    line-height: 1.4,
    font-weight: 400
  )
);
```

## Spacing System

### Base Unit: 8px
```scss
$spacing: (
  0: 0,
  1: 0.25rem,   // 4px
  2: 0.5rem,    // 8px
  3: 0.75rem,   // 12px
  4: 1rem,      // 16px
  5: 1.25rem,   // 20px
  6: 1.5rem,    // 24px
  8: 2rem,      // 32px
  10: 2.5rem,   // 40px
  12: 3rem,     // 48px
  16: 4rem,     // 64px
  20: 5rem,     // 80px
  24: 6rem,     // 96px
  32: 8rem      // 128px
);
```

## Component Specifications

### Buttons

#### Primary Button
```scss
.btn-primary {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, $primary-600, $primary-700);
  color: white;
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, $primary-500, $primary-600);
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba($primary-600, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}
```

#### Secondary Button
```scss
.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.75rem;
  background: $dark-800;
  color: white;
  border: 1px solid $dark-700;
  transition: all 0.2s ease;
  
  &:hover {
    background: $dark-700;
    border-color: $dark-600;
  }
}
```

### Cards

#### Standard Card
```scss
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
}
```

### Form Elements

#### Input Fields
```scss
.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba($dark-900, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid $dark-700;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: $dark-400;
  }
  
  &:focus {
    outline: none;
    border-color: $primary-500;
    box-shadow: 0 0 0 3px rgba($primary-500, 0.1);
  }
  
  &:hover {
    border-color: $dark-600;
  }
}
```

## Layout Grid System

### 12-Column Grid
```scss
.grid {
  display: grid;
  gap: 1.5rem;
  
  &.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  &.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  &.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  &.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  &.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
  &.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
}
```

### Responsive Breakpoints
```scss
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  2xl: 1536px
);
```

## Animation Guidelines

### Transition Timing
```scss
$transitions: (
  fast: 0.15s,
  normal: 0.2s,
  slow: 0.3s,
  slower: 0.5s
);
```

### Easing Functions
```scss
$easing: (
  ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94),
  ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1),
  bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
);
```

### Common Animations
```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba($primary-500, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba($primary-500, 0.6);
  }
}
```

## Accessibility Standards

### Color Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Focus States
```scss
.focus-visible {
  outline: 2px solid $primary-500;
  outline-offset: 2px;
}
```

### Screen Reader Support
- All interactive elements have proper ARIA labels
- Semantic HTML structure
- Skip navigation links
- Proper heading hierarchy

## Component Usage Examples

### Dashboard Card
```typescript
<Card className="dashboard-card">
  <CardHeader>
    <CardTitle>Learning Progress</CardTitle>
    <CardDescription>Your weekly learning statistics</CardDescription>
  </CardHeader>
  <CardContent>
    <ProgressChart data={progressData} />
  </CardContent>
</Card>
```

### Navigation Item
```typescript
<NavItem 
  href="/dashboard" 
  icon={HomeIcon} 
  label="Dashboard"
  isActive={pathname === '/dashboard'}
/>
```

### Form Field
```typescript
<FormField>
  <FormLabel htmlFor="email">Email Address</FormLabel>
  <FormInput 
    id="email"
    type="email"
    placeholder="Enter your email"
    required
  />
  <FormError>{errors.email?.message}</FormError>
</FormField>
```

This style guide ensures consistency across all components and provides clear guidelines for future development.