# Ingredient Search View - Implementation Plan

## 📋 Overview
A dedicated view that allows users to search for recipes by ingredient (e.g., "falukorv", "lax"). This feature enhances recipe discovery by enabling users to find meals they can make with specific ingredients they have or want to use.

---

## 🎯 Requirements Summary

### ✅ Functional Requirements
- Simple single-word filtering of recipes containing that ingredient
- Search through all saved meals/recipes in the user's collection  
- Match against recipe ingredients, name, and description
- Show matching recipes in a clean, scrollable list
- Click on a result to view the full recipe details
- Accessible from both `/meals` page and `/mealplan` page via a button

### ✅ Non-Functional Requirements
- Fast search response (< 100ms for typical datasets)
- Responsive design for mobile and desktop
- Keyboard navigation and screen reader support
- Support both Swedish and English
- Follow existing design patterns and styling conventions

---

## 🏗️ Technical Design

### 📁 Component Structure
- **New Component**: `src/components/IngredientSearchView.tsx` - Main search view
- **Route**: `/ingredients` - Dedicated route for search functionality

### 🔄 Data Flow
- **State**: Local state for search query and filtered results
- **Data Source**: Use existing `useApp().meals` via context
- **Filtering**: `useMemo` for efficient search through meal ingredients

### 🔍 Search Algorithm
```typescript
const filteredMeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    return meals.filter(meal => {
        const hasIngredient = meal.ingredients?.some(ingredient => 
            ingredient.text.toLowerCase().includes(query)
        );
        const hasInName = meal.name.toLowerCase().includes(query);
        const hasInDescription = meal.description?.toLowerCase().includes(query);
        return hasIngredient || hasInName || hasInDescription;
    });
}, [meals, searchQuery]);
```

---

## 🚀 Step-by-Step Implementation

### 📦 CHUNK 1: Setup & Routing
**Goal**: Create the basic component structure and routing

- [ ] **Create IngredientSearchView.tsx**
  - [ ] Set up basic component skeleton with TypeScript
  - [ ] Import necessary hooks: `useState`, `useMemo`, `useApp`, `useTranslation`
  - [ ] Import icons: `Search`, `X` from lucide-react
  - [ ] Add component structure with header and main content area
  
- [ ] **Add Route Configuration**
  - [ ] Import `IngredientSearchView` in `src/App.tsx`
  - [ ] Add route: `{ path: "/ingredients", element: <IngredientSearchView /> }`
  - [ ] Test route navigation manually

- [ ] **Add Navigation Buttons**
  - [ ] Add search button to `MealsView.tsx` header
  - [ ] Add search button to `MealPlanView.tsx` header
  - [ ] Use `useNavigate` hook for navigation
  - [ ] Style buttons consistently with existing patterns

### 🌐 CHUNK 2: Internationalization
**Goal**: Add translations for the new feature

- [ ] **Add English Translations** (`src/locales/en.json`)
  - [ ] Add `ingredientSearch.title`: "Search by Ingredient"
  - [ ] Add `ingredientSearch.placeholder`: "Search by ingredient..."
  - [ ] Add `ingredientSearch.noResults`: "No recipes found for '{{query}}'"
  - [ ] Add `ingredientSearch.foundResults`: "Found {{count}} recipe(s)"
  - [ ] Add `meals.searchByIngredient`: "Search by Ingredient"
  
- [ ] **Add Swedish Translations** (`src/locales/sv.json`)
  - [ ] Add `ingredientSearch.title`: "Sök på ingrediens"
  - [ ] Add `ingredientSearch.placeholder`: "Sök på ingrediens..."
  - [ ] Add `ingredientSearch.noResults`: "Inga recept hittades för '{{query}}'"
  - [ ] Add `ingredientSearch.foundResults`: "Hittade {{count}} recept"
  - [ ] Add `meals.searchByIngredient`: "Sök på ingrediens"

### 🔍 CHUNK 3: Core Search Functionality
**Goal**: Implement the basic search logic

- [ ] **Add Search State**
  - [ ] Add `searchQuery` state with `useState('')`
  - [ ] Add search input field with proper styling
  - [ ] Add clear button to reset search
  - [ ] Add auto-focus on component mount

- [ ] **Implement Search Logic**
  - [ ] Add `filteredMeals` using `useMemo` (see algorithm above)
  - [ ] Handle empty search state (show prompt to enter search term)
  - [ ] Handle no results state
  - [ ] Add debounced search (300ms delay)

- [ ] **Display Search Results**
  - [ ] Create results container with proper layout
  - [ ] Map through `filteredMeals` to display recipe cards
  - [ ] Show recipe name, image (if available), and tags
  - [ ] Add empty state message when no results

### 🎨 CHUNK 4: Styling & UI Polish
**Goal**: Make the interface visually consistent and responsive

- [ ] **Apply Tailwind Styling**
  - [ ] Style search input with consistent padding, borders, and focus states
  - [ ] Style results container with proper spacing
  - [ ] Style recipe cards to match existing MealsView patterns
  - [ ] Add hover effects and transitions

- [ ] **Responsive Design**
  - [ ] Ensure mobile-first layout
  - [ ] Test on mobile viewport (max-width: 768px)
  - [ ] Test on desktop viewport
  - [ ] Adjust grid layout for different screen sizes

- [ ] **Add Visual Feedback**
  - [ ] Add loading state if search takes time
  - [ ] Add result count display: "Found X recipes"
  - [ ] Add clear visual hierarchy

### ⚡ CHUNK 5: Enhanced Features
**Goal**: Add quick actions and improve user experience

- [ ] **Add Quick Actions to Results**
  - [ ] Add "View Details" button to each recipe card
  - [ ] Add "Plan Meal" button to each recipe card
  - [ ] Add "Add to Shopping List" button to each recipe card
  - [ ] Integrate with existing modals (`MealDetailModal`, `PlanMealModal`, etc.)

- [ ] **Improve Search Results**
  - [ ] Show number of matching ingredients per recipe
  - [ ] Highlight matching ingredients in results
  - [ ] Add recipe tags display
  - [ ] Add recipe servings information

### ♿ CHUNK 6: Accessibility
**Goal**: Ensure the feature is accessible to all users

- [ ] **Keyboard Navigation**
  - [ ] Ensure search input is focusable via keyboard
  - [ ] Add keyboard navigation between results
  - [ ] Add proper tab order

- [ ] **Screen Reader Support**
  - [ ] Add ARIA labels to search input
  - [ ] Add ARIA labels to buttons and interactive elements
  - [ ] Add ARIA live regions for dynamic content
  - [ ] Ensure proper semantic HTML structure

### 🧪 CHUNK 7: Testing & Validation
**Goal**: Ensure the feature works correctly and passes all checks

- [ ] **Unit Tests**
  - [ ] Create `IngredientSearchView.test.tsx`
  - [ ] Test search functionality with various inputs
  - [ ] Test empty state handling
  - [ ] Test navigation to recipe details
  - [ ] Test translation rendering

- [ ] **Integration Tests**
  - [ ] Test route navigation
  - [ ] Test button integration in MealsView
  - [ ] Test button integration in MealPlanView
  - [ ] Test modal interactions

- [ ] **Manual Testing**
  - [ ] Test on mobile devices
  - [ ] Test on desktop browsers
  - [ ] Test accessibility features
  - [ ] Test performance with large datasets

- [ ] **Validation**
  - [ ] Run `npm run lint` - fix any linting errors
  - [ ] Run `npm run check-any` - ensure no `any` types
  - [ ] Run `npm run test` - ensure all tests pass
  - [ ] Run `npm run build:only` - ensure build succeeds
  - [ ] Run `npm run validate` - ensure full validation passes

---

## 📁 File Changes Summary

### ✨ New Files to Create
| File | Purpose | Status |
|------|---------|--------|
| `src/components/IngredientSearchView.tsx` | Main search view component | ⬜ |
| `src/components/IngredientSearchView.test.tsx` | Unit tests for search functionality | ⬜ |

### 📝 Files to Modify
| File | Changes | Status |
|------|---------|--------|
| `src/App.tsx` | Add `/ingredients` route | ⬜ |
| `src/components/MealsView.tsx` | Add search button in header | ⬜ |
| `src/components/MealPlanView.tsx` | Add search button in header | ⬜ |
| `src/locales/en.json` | Add ingredient search translations | ⬜ |
| `src/locales/sv.json` | Add ingredient search translations | ⬜ |

### ✅ Files Not Needing Changes
- `src/types/index.ts` - Existing types are sufficient
- `src/context/AppContext.tsx` - Existing context provides needed data
- All hook files - Existing hooks are sufficient

---

## 🎯 Success Criteria

### ✅ MVP Completion Checklist
- [ ] Search functionality works correctly with ingredient matching
- [ ] Results display properly in a clean, scrollable list
- [ ] Navigation between pages works (buttons and route)
- [ ] Translations are complete for both English and Swedish
- [ ] No TypeScript errors or warnings
- [ ] No linting errors
- [ ] All tests pass
- [ ] Full validation passes (`npm run validate`)

### ✅ Quality Gates
- [ ] All existing functionality still works
- [ ] No breaking changes to existing components
- [ ] Code follows existing patterns and conventions
- [ ] All TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile and desktop
- [ ] Accessibility features are implemented

---

## ⏱️ Estimated Timeline

### 🚀 MVP (2-4 hours)
- **Chunk 1: Setup & Routing** - 30-45 minutes
- **Chunk 2: Internationalization** - 15-20 minutes  
- **Chunk 3: Core Search Functionality** - 1-1.5 hours
- **Chunk 4: Styling & UI Polish** - 30-45 minutes

### ⚡ Enhanced Features (2-3 hours)
- **Chunk 5: Enhanced Features** - 1-1.5 hours
- **Chunk 6: Accessibility** - 30-45 minutes
- **Chunk 7: Testing & Validation** - 30-45 minutes

---

## 💡 Implementation Notes

### 🔧 Technical Considerations
- Use existing `useApp()` hook for data access
- Follow existing component patterns from `MealsView.tsx`
- Reuse existing modals for quick actions
- Use Tailwind classes for styling consistency

### 🎨 Design Considerations  
- Match existing color scheme and spacing
- Use consistent card styling with MealsView
- Ensure mobile-first responsive design
- Follow existing accessibility patterns

### 🌍 Internationalization Notes
- All user-facing text must have translation keys
- Use `useTranslation()` hook in the component
- Test both languages work correctly

### 🚨 Error Handling
- Handle empty search gracefully
- Show friendly message when no results found
- Handle null/undefined ingredients safely
- Use existing error handling patterns

---

## 🔮 Future Enhancements

### 📅 v2 Features (Post-MVP)
- [ ] Multi-word search support
- [ ] Fuzzy matching for typos
- [ ] Search suggestions as user types
- [ ] Ingredient autocomplete dropdown
- [ ] Filter by tags combined with ingredient search
- [ ] Search history functionality

### 📅 v3 Features (Future)
- [ ] Pantry integration - search by ingredients user has at home
- [ ] Recipe import from external sources
- [ ] Nutritional information in results
- [ ] Direct meal planning from search results

---

## 📋 Quick Start Guide

### To Begin Implementation:
1. **Start with Chunk 1** - Create the basic component and routing
2. **Test each chunk** before moving to the next
3. **Commit frequently** with descriptive Swedish commit messages
4. **Run validation** after each major change

### Example Commit Messages:
- `feat: lägg till ingredienssökvy`
- `feat: implementera sökfunktionalitet för ingredienser`
- `fix: justera layout för mobilvy`

---

*Last Updated: 2026-09-03*
*Status: Chunks 1-5 Completed ✅ | Chunks 6-7 Remaining ⏳ | MVP Ready 🎉*

---

## 📊 Implementation Progress Summary

### ✅ COMPLETED (Chunks 1-5)
- **Chunk 1: Setup & Routing** - Component created, routing configured, navigation buttons added
- **Chunk 2: Internationalization** - All translations added for EN/SV
- **Chunk 3: Core Search Functionality** - Search logic implemented with debouncing
- **Chunk 4: Styling & UI Polish** - Tailwind styling applied, responsive design
- **Chunk 5: Enhanced Features** - Quick actions, match indicators, modal integrations

### ⏳ REMAINING (Chunks 6-7)
- **Chunk 6: Accessibility** - Keyboard navigation, ARIA labels, screen reader support
- **Chunk 7: Testing & Validation** - Unit tests, integration tests, manual testing

### 🎯 Current Status: MVP READY
The Ingredient Search View is fully functional and deployed to main. All core features are implemented and working. Only accessibility enhancements and formal testing remain.