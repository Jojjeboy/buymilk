# Förslag på förbättringar: Måltider & Måltidsplanering

Detta dokument beskriver föreslagna funktioner, förbättringar och refaktoreringar för att lyfta funktionaliteten kring måltider och måltidsplanering. Förslagen är kategoriserade efter beroenden för att tydliggöra vad som kan implementeras direkt och vad som kräver fundamentala ändringar först.

---

## Sektion A: Direkta förbättringar (Kan göras nu)

_Dessa funktioner är oberoende av receptsystemet och kan implementeras med nuvarande datamodell._

### 1. UX/UI Förbättringar

- **Veckokopiering:** Möjlighet att kopiera hela förra veckans plan till nästa vecka.
- **Tydligare "Idag":** Markera den nuvarande dagen i schemat med en accentfärg eller tydligare visuell indikator.
- **Snabba Val:** Implementera en "Överraska mig"-knapp som slumpmässigt väljer en måltid från användarens befintliga favoritlista.

---

## Sektion B: Fundamentala byggstenar (Krävs för vidare utveckling)

_Detta är grunden som måste finnas på plats innan Sektion C kan implementeras._

### 1. Integration av Receptsystemet

För närvarande är "Måltider" bara namnsträngar. Vi behöver aktivera `Recipe`-typen i gränssnittet.

- **Receptredigerare:** Skapa en vy/modal för att lägga till detaljer:
  - Ingredienser (mängd, enhet, namn).
  - Steg-för-steg instruktioner.
  - Taggar (t.ex. "Vegetariskt", "Snabblagat").
  - Portioner.
- **Koppling Måltid $\rightarrow$ Recept:** Möjlighet att konvertera en enkel text-måltid till ett fullständigt recept.
- **Typstärkning:** Uppdatera `PlannedMeal` så att den striktare hanterar skillnaden mellan en `customTitle` (ad-hoc) och en `recipeId` (länkad till receptbiblioteket).

---

## Sektion C: Avancerade funktioner (Beroende av Sektion B)

_Dessa funktioner kräver att receptsystemet i Sektion B är implementerat._

### 1. Automatiserad Inköpslista (Synergi)

- **"Generera inköpslista":** En knapp i `MealPlanView` som analyserar planerade recept och automatiskt lägger till ingredienserna i `GroceryListView`.
- **Intelligent Sammanslagning:** Summera mängder av samma ingrediens från olika recept.
- **Checklista för Hemmet:** Utnyttja `checkIfExistAtHome` för att filtrera bort basvaror.

### 2. Fördjupad UX för Recept

- **Receptbibliotek:** Förbättra `MealsView` så att den visar receptkort med taggar och snabbvy över ingredienser.
- **Visuella Indikatorer i Planen:** Visa små ikoner/taggar (t.ex. en grön prick för vegetariskt) direkt i måltidsschemat.
- **Drag-and-Drop:** Flytta måltider mellan dagar (fungerar bäst när måltiderna är definierade objekt snarare än bara text).

---

## Uppdaterad Roadmap

1. **Fas 1 (Quick Wins):** Veckokopiering $\rightarrow$ "Idag"-markering.
2. **Fas 2 (Grunden):** Implementera Receptredigerare och koppla `Meal` $\rightarrow$ `Recipe`.
3. **Fas 3 (Integration):** Bygg bryggan mellan `MealPlan` och `GroceryList` (Automatisk inköpslista).
4. **Fas 4 (Polering):** Receptbibliotek med kort, taggar i schemat och Drag-and-Drop.
5. **Fas 5 (Analys):** Implementera statistik (t.ex. måltidsvariation över tid).
