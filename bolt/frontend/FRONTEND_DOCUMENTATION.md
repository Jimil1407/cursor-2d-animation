# Frontend Documentation

This document provides detailed information about the frontend architecture, components, and development guidelines.

## Technology Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **API Client**: Axios
- **Animation Library**: Framer Motion
- **Form Handling**: React Hook Form
- **Code Quality**: ESLint + Prettier

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── store/         # State management
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Root component
├── public/            # Static assets
└── index.html         # Entry HTML file
```

## Component Architecture

### Core Components

1. **Layout Components**
   - `MainLayout`: Base layout with navigation and footer
   - `AuthLayout`: Layout for authentication pages
   - `DashboardLayout`: Layout for authenticated user dashboard

2. **Animation Components**
   - `AnimationCanvas`: Main canvas for animation creation
   - `Timeline`: Animation timeline control
   - `ToolPanel`: Animation tools and properties
   - `PreviewPanel`: Animation preview window

3. **UI Components**
   - `Button`: Custom button component
   - `Input`: Form input component
   - `Modal`: Modal dialog component
   - `Toast`: Notification component

## State Management

The application uses a combination of React Context and custom hooks for state management:

```typescript
// Example of a custom hook
const useAnimation = () => {
  const [animation, setAnimation] = useState<Animation>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  // ... implementation

  return { animation, isLoading, error };
};
```

## API Integration

API calls are centralized in the `services` directory:

```typescript
// Example of an API service
const animationService = {
  create: async (data: CreateAnimationDTO) => {
    const response = await axios.post('/api/animation/create', data);
    return response.data;
  },
  // ... other methods
};
```

## Styling Guidelines

1. Use Tailwind CSS utility classes for styling
2. Follow mobile-first responsive design
3. Use CSS variables for theme colors
4. Maintain consistent spacing using Tailwind's spacing scale

Example:
```tsx
<div className="flex flex-col space-y-4 p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl font-bold text-gray-900">
    Animation Title
  </h1>
</div>
```

## Performance Optimization

1. **Code Splitting**
   - Use React.lazy for route-based code splitting
   - Implement dynamic imports for large components

2. **Memoization**
   - Use React.memo for expensive components
   - Implement useMemo and useCallback where appropriate

3. **Asset Optimization**
   - Optimize images using next-gen formats
   - Implement lazy loading for images
   - Use proper caching strategies

## Development Workflow

1. **Setup**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Linting**
   ```bash
   npm run lint
   ```

## Testing

1. **Unit Tests**
   - Use Jest for unit testing
   - Test individual components and hooks

2. **Integration Tests**
   - Use React Testing Library
   - Test component interactions

3. **E2E Tests**
   - Use Cypress for end-to-end testing
   - Test critical user flows

## Best Practices

1. **Code Organization**
   - Keep components small and focused
   - Use proper TypeScript types
   - Follow consistent naming conventions

2. **Error Handling**
   - Implement proper error boundaries
   - Use toast notifications for user feedback
   - Log errors appropriately

3. **Accessibility**
   - Use semantic HTML
   - Implement ARIA attributes
   - Ensure keyboard navigation
   - Maintain proper color contrast

4. **Security**
   - Sanitize user inputs
   - Implement proper authentication flow
   - Use environment variables for sensitive data

## Deployment

1. **Build Process**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Create `.env.production` for production
   - Create `.env.development` for development

3. **Deployment Checklist**
   - [ ] Run all tests
   - [ ] Check bundle size
   - [ ] Verify environment variables
   - [ ] Test in staging environment
   - [ ] Deploy to production 