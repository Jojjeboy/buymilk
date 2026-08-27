# Coding Standards

## TypeScript & Type Safety

- **Strict Typing:** Avoid the use of `any`. Use interfaces or types for all data structures.
- **Type Definitions:** Centralize shared types in `src/types/index.ts`.
- **Null Safety:** Use optional chaining (`?.`) and nullish coalescing (`??`) to handle potentially undefined values.

## React Patterns

- **Functional Components:** Use functional components with hooks.
- **Component Structure:** Keep components small and focused. Extract complex logic into custom hooks in `src/hooks/`.
- **Props:** Define clear prop types for every component.

## Styling

- **Tailwind CSS:** Use Tailwind utility classes for all styling.
- **Consistency:** Follow the existing design patterns for spacing, colors, and typography.
- **Dynamic Classes:** Use `clsx` or `tailwind-merge` for conditional styling.
