# Förslag på förbättringar: Måltider & Måltidsplanering

Detta dokument beskriver föreslagna funktioner, förbättringar och refaktoreringar för att lyfta funktionaliteten kring måltider och måltidsplanering.

---

## Sektion A: Direkta förbättringar (Delvis implementerat)

_Dessa funktioner är oberoende av receptsystemet och kan implementeras med nuvarande datamodell._

### 1. UX/UI Förbättringar

- [x] **Veckokopiering:** Möjlighet att kopiera hela förra veckans plan till nästa vecka.
- [x] **Tydligare "Idag":** Markera den nuvarande dagen i schemat med en accentfärg eller tydligare visuell indikator.
- [ ] **Snabba Val:** Implementera en "Överraska mig"-knapp som slumpmässigt väljer en måltid från användarens befintliga favoritlista.

---

## Sektion B: Fundamentala byggstenar (Implementerat ✅)

_Grunden för receptsystemet är nu på plats._

### 1. Integration av Receptsystemet

- [x] **Datamodell:** `Recipe`-typ och `PlannedMeal`-koppling är implementerade.
- [x] **Receptvy:** `RecipeDetailModal` skapad för att visa ingredienser, instruktioner och taggar.
- [x] **Typstärkning:** Hantering av `recipeId` vs `customTitle` är på plats i typerna.
- [x] **Receptredigering:** Grundläggande stöd för att lägga till detaljer i måltider.

---

## Sektion C: Avancerade funktioner (Pågående)

_Dessa funktioner utnyttjar nu det implementerade receptsystemet i Sektion B._

### 1. Automatiserad Inköpslista (Högsta prioritet)

- [x] **"Generera inköpslista":** En knapp i `MealPlanView` som analyserar planerade recept och automatiskt lägger till ingredienserna i `GroceryListView`.
- [ ] **Intelligent Sammanslagning:** Summera mängder av samma ingrediens från olika recept.
- [x] **Checklista för Hemmet:** Utnyttja `checkIfExistAtHome` för att filtrera bort basvaror.

### 2. Fördjupad UX för Recept

- [ ] **Receptbibliotek:** Förbättra `MealsView` så att den visar receptkort med taggar och snabbvy över ingredienser.
- [ ] **Visuella Indikatorer i Planen:** Visa små ikoner/taggar (t.ex. en grön prick för vegetariskt) direkt i måltidsschemat.
- [ ] **Drag-and-Drop:** Flytta måltider mellan dagar.

---

## Uppdaterad Roadmap

1. **Fas 1 (Quick Wins - Nu):** Veckokopiering ✅ $\rightarrow$ "Idag"-markering ✅ $\rightarrow$ "Överraska mig".
2. **Fas 2 (Integration - Pågående):**
   - Bygg bryggan mellan `MealPlan` och `GroceryList` (Automatisk inköpslista) ✅.
   - Implementera intelligent sammanslagning av ingredienser.
3. **Fas 3 (Polering - Framtida):** Receptbibliotek med kort, taggar i schemat och Drag-and-Drop.
4. **Fas 4 (Analys - Framtida):** Implementera statistik (t.ex. måltidsvariation över tid).
