# What's New Modal - Implementation Plan

## Overview
A modal that displays recent changes/updates to the application since the user's last visit. This helps users stay informed about new features, improvements, and bug fixes.

## Requirements

### Functional Requirements
- Display a modal on app startup if there are new changes since last visit
- Show a list of changes with version, title, description, and category
- Mark changes as "seen" to prevent showing them again
- Option to dismiss the modal without marking as seen
- Option to view all past changes (change log)

### Non-Functional Requirements
- Use localStorage to track last viewed changes
- Lightweight and fast loading
- Follow existing design patterns and styling
- Responsive design for mobile and desktop
- Accessible (keyboard navigation, screen reader support)

## Technical Design

### Data Structure

#### Change Item Interface
```typescript
interface ChangeItem {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bugfix' | 'other';
  severity?: 'major' | 'minor' | 'patch';
}
```

#### LocalStorage Structure
```typescript
interface WhatsNewState {
  lastViewedVersion: string;
  lastViewedDate: string;
  dismissedChanges: string[];
}
```