# Project Architecture & Domain Rules

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript.
- **Backend/Database:** Firebase (Firestore, Auth).
- **Styling:** Tailwind CSS.
- **Internationalization:** i18next.

## Firebase & Firestore

- **Data Sync:** Use the custom hooks in `src/hooks/` (e.g., `useFirestoreSync`) for database interactions to ensure consistency.
- **Security:** Always consider Firestore security rules when proposing changes to data structures.

## Internationalization (i18n)

- **Localization Files:** All user-facing strings must be stored in `src/locales/sv.json` (Swedish) and `src/locales/en.json` (English).
- **Adding Strings:** When adding a new feature, ensure that keys are added to BOTH language files to prevent missing translations.
- **Usage:** Use the `useTranslation` hook from `react-i18next` for all text.

## Project Structure

- `src/components/`: UI components. Keep them focused and small.
- `src/context/`: Global state management using React Context.
- `src/hooks/`: Reusable business logic and Firebase integration.
- `src/types/`: Centralized TypeScript definitions.
- `src/utils/`: Pure helper functions.
- `src/locales/`: Translation files.
