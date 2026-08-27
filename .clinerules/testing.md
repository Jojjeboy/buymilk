# Testing Standards

## Testing Framework

- **Vitest:** Use Vitest for all unit and integration tests.
- **React Testing Library:** Use `@testing-library/react` for component testing.

## Testing Requirements

- **New Features:** Every new feature or significant bug fix must include corresponding tests in a `.test.tsx` or `.test.ts` file.
- **Coverage:** Aim for high coverage of business logic and critical user paths.
- **Test Naming:** Use descriptive test names that explain the expected behavior (e.g., `should render shopping list when items are present`).

## Execution

- **Full Suite:** Run `npm run test` to execute all tests.
- **Targeted Tests:** When working on a specific component, run only the relevant test file to speed up the feedback loop.
