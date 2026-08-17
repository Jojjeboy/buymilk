# BuyMilk - Improvements Checklist

This document tracks planned and proposed improvements for the **BuyMilk** application. Use the checkboxes below to track your progress as they are implemented.

## 🚀 Smart & Productivity Features
- [ ] **Backend**: Implement a backend in firebase
- [x] **Aisle/Category Auto-Grouping**: Group items automatically by category (e.g., Dairy, Produce, Bakery) based on database templates, so shopping trips are optimized by store aisle.
- [x] **Voice-to-Text Input**: Use the Web Speech API to allow hands-free adding of items using voice commands.
- [x] **Recipe Ingredient Import (Text)**: Add a parser to import ingredients from pasted recipe text.
- [ ] **Recipe Ingredient Import (URL)**: Implement a backend scraper to import ingredients from recipe URLs.

## 🎨 UI/UX & Accessibility
- [x] **Dark Mode / System Theme Sync**: Expand the settings options to allow syncing automatically with the system's light/dark mode.
- [ ] **Custom Category Colors & Icons**: Allow users to customize category tags with distinct colors and icons.
- [x] **Quick Swipe Actions**: Implement left/right swipe gestures on mobile to quickly delete or edit items.

## ⚙️ Offline & Sync
- [x] **Sync Status Indicator**: Add a visual cloud icon/spinner in the navbar showing when changes are local-only vs. successfully synced to Firebase.
- [ ] **Export to CSV/PDF**: Generate a printable PDF or a clean CSV file of the shopping list.
