# Implementation Plan: Recipe Ingredient Import (Text)

## Objective
Add the ability to import grocery items from pasted recipe text, reducing manual entry for users. (Note: URL import is deferred to a separate backend implementation plan).

## Technical Strategy

### 1. Text Parsing (Client-Side)
Since recipe text is often unstructured, we need a robust parser to extract the core ingredient.
- **Logic**: 
    - Split input by newlines.
    - Use regex to strip common quantity patterns (e.g., "1/2 cup", "200g", "3 tbsp").
    - Clean up trailing/leading whitespace and common filler words ("of", "fresh").
- **Location**: `src/utils/recipeParser.ts`

### 2. UI/UX Integration
Integrate the text parsing functionality into the existing import workflow.
- **Modal Update**: Modify `ImportItemsModal.tsx` or create a new `RecipeImportModal.tsx`.
- **New Features**:
    - **Input Toggle**: Switch between "JSON Import" and "Recipe Text Import".
    - **Text Area**: A larger text area for pasting raw ingredient lists.
    - **Preview List**: A checklist of parsed ingredients allowing users to deselect items they already have before final import.
- **Localization**: Add new keys to `en.json` and `sv.json` for recipe-related labels and errors.

## Detailed Implementation Steps

### Phase 1: Utilities & Types
- [ ] Create `src/utils/recipeParser.ts` with a `parseRecipeText(text: string): string[]` function.
- [ ] Implement regex patterns to handle various measurement units and quantity formats.

### Phase 2: Frontend UI
- [ ] Create `src/components/RecipeImportModal.tsx` (or extend `ImportItemsModal`).
- [ ] Implement the pasted text parsing logic using the new utility.
- [ ] Build the "Preview & Confirm" list UI where users can review parsed items.
- [ ] Connect the final "Import" button to the existing `onImport` handler.

### Phase 3: Polish & Testing
- [ ] Add error handling for empty inputs or failed parsing.
- [ ] Test with various recipe text formats (e.g., bulleted lists, comma-separated, mixed quantities).
- [ ] Verify localization for all new UI elements.

## Success Criteria
- Users can paste a block of recipe text and have it split into individual, cleaned items.
- Users can review and edit the list before adding it to their grocery list.
- The implementation is entirely client-side and does not require a backend.