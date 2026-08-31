# 📋 Implementationsplan: MealPlanView UI Redesign & Förenkling

## 🎯 Översikt

Detta dokument beskriver den stegvisa processen för att genomföra en fullständig UI-redesign och förenkling av `MealPlanView.tsx`. Målet är att skapa en modern, ren och intuitiv måltidsplanerare med tydlig färgkodning, reducerat visuellt brus och strömlinjeformade åtgärder för både mobil och desktop.

> **Obs:** Denna plan utgår från att refaktorisera och bygga om `src/components/MealPlanView.tsx` direkt från grunden utan beroende till tidigare temporära filer.

---

## 🎨 Designkoncept & Principer

### 1. Färgkodade Måltidstyper
För snabb visuell igenkänning färgkodas måltiderna konsekvent:
- 🥗 **Lunch**: Grön/Smaragd (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800`)
- 🍲 **Middag (Dinner)**: Blå/Indigo (`bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800`)
- 🍎 **Mellanmål (Snack)** *(framtidssäker/valfri)*: Bärnsten/Gul (`bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800`)

### 2. Förenklad Layout (Mindre brus, mer fokus)
- **Kompakt och samlad header**: Veckonavigering (Föregående, Idag, Nästa) centrerad/samlad. Globala verktyg (Exportera kalender/JSON, Kopiera vecka, Skapa inköpslista) grupperas i en stilren åtgärdsrad.
- **Tydliga dagskort**:
  - Dagens datum och veckodag tydligt separerade.
  - "Idag"-markering med diskret accentfärg och ring-effekt.
  - Snabbknapp för att lägga dagens ingredienser i inköpslistan integrerad direkt i dagshuvudet.
- **Måltidsplatser**:
  - Tom plats: Subtil klickbar yta med tydlig placeholder ("Vad ska ätas?") och snabbknapp för slumpmässig måltid (tärningsikon).
  - Fylld plats: Tydlig måltidstitel, dubblettvarning om samma rätt återkommer under veckan, samt diskreta åtgärdsikoner för favoriter (hjärta) och receptvisning (bok).

### 3. Responsivitet
- **Mobil**: Vertikalt staplade dagskort med touch-vänliga klickytor.
- **Desktop/Surfplatta**: Luftig och välstrukturerad vy som utnyttjar bredden utan att bli plottrig.

---

## 📝 Stegvis Implementationsplan

---

### 🔹 Fas 1: Förberedelser & Analys (Prioritet 1)

#### Steg 1.1: Granska beroenden och gränssnitt
Kontrollera att alla nödvändiga hooks och funktioner är tillgängliga:
- `useMealPlan()`: `mealPlans`, `meals`, `getMealText`, `handleMealChange`, `handleSaveToLibrary`, `copyPreviousWeek`
- `useApp()`: `addItemsToList`, `defaultListId`
- `useToast()`: `showToast`
- `useTranslation()`: `t`
- Modaler: `MealPlanEditModal`, `RandomMealModal`, `RecipeDetailModal`, `Modal` (export)
- Datum- och kalenderverktyg: `getISOWeek`, `formatDate`, `getDayName`, `exportMealPlanToICS`

---

### 🔹 Fas 2: Ombyggnad av `MealPlanView.tsx` (Prioritet 2)

Implementera den förenklade designen direkt i `src/components/MealPlanView.tsx`.

#### Steg 2.1: Header & Veckonavigering
- Skapa en ren header med titel, aktuell vy (t.ex. rullande 7-dagarsvy / Vecka X) och sammanhållen knappgrupp.
- Implementera navigering:
  - Föregående vecka (`ChevronLeft`)
  - "Idag"-återställning
  - Nästa vecka (`ChevronRight`)
- Lägg till primära verktygsknappar med tydliga tooltips och stilrena ikoner:
  - 📋 Kopiera förra veckan (`handleCopyPreviousWeek`)
  - 🛒 Generera veckans inköpslista (`setIsConfirmAddIngredientsOpen(true)`)
  - 📅 Exportera till iCal/ICS (`handleExportToCalendar`)
  - 📥 Exportera till JSON (`setIsExportOpen(true)`)

#### Steg 2.2: Dagskort & Layoutstruktur
- Rendera `displayDays` (7 dagar från `startDate`).
- Gruppera med veckohuvud (t.ex. "Vecka 36") när veckonummer ändras.
- Strukturera varje dag som ett enhetligt kort:
  - **Vänster kolumn (Dag-header)**: Veckodag, datum, "Idag"-badge och snabbknapp för dagens inköpslista.
  - **Måltidskolumner**: Dedikerade sektioner för Lunch och Middag (färgkodade).

#### Steg 2.3: Färgkodade måltidskort & Interaktioner
- Bygg en återanvändbar eller strömlinjeformad måltidsrad per måltidstyp (`lunch` / `dinner`):
  - Färgkodad badge/label med ikon (`Utensils`) och namn ("Lunch" / "Middag").
  - Klickbar ruta för att öppna `MealPlanEditModal`.
  - Tom måltid: Placeholdertext ("Vad ska ätas?") + tärningsikon för `RandomMealModal`.
  - Planerad måltid: Måltidsnamn, recept-taggar, dubblettvarning vid frekvent förekomst.
  - Åtgärder vid planerad måltid:
    - Favoritmarkering: Hjärtikon (`Heart`) med sparstatus.
    - Receptvisning: Bokikon (`BookOpen`) om recept finns sparat i biblioteket.

#### Steg 2.4: Modaler och Dialoger
- Säkerställ full funktionalitet för:
  - Redigeringsmodal (`MealPlanEditModal`)
  - Slumpningsmodal (`RandomMealModal`)
  - Receptdetaljer (`RecipeDetailModal`)
  - JSON-exportmodal (`Modal`)
  - Bekräftelsemodal för generering av inköpslista (`Modal`)

---

### 🔹 Fas 3: Översättningar (i18n) (Prioritet 3)

Säkerställ att alla texter i `MealPlanView` använder `i18next` och har motsvarigheter i både svenska (`src/locales/sv.json`) och engelska (`src/locales/en.json`).

#### Relevanta nycklar att synka:
```json
"mealplan": {
  "title": "Måltidsschema",
  "rollingView": "Rullande 7-dagarsvy",
  "weekInfo": "Vecka {{weekNumber}}",
  "today": "Idag",
  "whatToEat": "Vad ska ätas?",
  "lunch": "Lunch",
  "dinner": "Middag",
  "snack": "Mellanmål",
  "addMeal": "Lägg till måltid",
  "randomMeal": "Slumpa måltid",
  "copyWeek": "Kopiera vecka",
  "generateList": "Skapa inköpslista",
  "dayList": "Dagens ingredienser",
  "exportCalendar": "Exportera till kalender (.ics)",
  "exportJson": "Exportera till JSON",
  "exportTitle": "Exportera måltidsplan",
  "exportMessage": "Här är din måltidsplan i JSON-format.",
  "viewRecipe": "Visa recept",
  "saveToFavorites": "Spara till favoriter",
  "savedToFavorites": "Måltid sparad till favoriter",
  "duplicateWarning": "Måltiden förekommer flera gånger denna vecka",
  "addIngredientsTitle": "Lägg till ingredienser",
  "addIngredientsMessage": "Vill du lägga till alla ingredienser från de planerade måltiderna i din inköpslista?"
}
```

---

### 🔹 Fas 4: Designharmonisering av Modaler (Prioritet 4)

För att den nya designen ska kännas enhetlig:
- Kontrollera `MealPlanEditModal.tsx` så att färgkoder och typsnitt harmonierar med den nya måltidskodningen (Lunch = Grön, Middag = Blå).
- Säkerställ att `RandomMealModal.tsx` och `RecipeDetailModal.tsx` matchar temat i både ljust och mörkt läge (dark mode).

---

### 🔹 Fas 5: Validering, Tester & Kvalitetssäkring (Prioritet 5)

#### Steg 5.1: Statisk typkontroll & Lint
```bash
npm run validate
```
*Krav: Inga TypeScript-fel eller brutna referenser.*

#### Steg 5.2: Enhetstester
```bash
npm run test
```
*Krav: Alla tester i `MealPlanView.test.tsx` och övriga komponenttester passerar.*

#### Steg 5.3: Manuell Testchecklista
- [ ] **Visuell layout**: Rent och luftigt intryck utan onödigt plottriga ramar.
- [ ] **Färgkodning**: Lunch har grön accent, Middag har blå accent.
- [ ] **Idag-markering**: Aktuell dag är tydligt utmärkt.
- [ ] **Veckonavigering**: Framåt, bakåt och "Idag" uppdaterar vyn korrekt.
- [ ] **Måltidsplanering**: Klick på tom eller befintlig måltid öppnar redigeringsmodal och sparar korrekt.
- [ ] **Slumpa måltid**: Tärningsikon öppnar slumpmodal och lägger till vald rätt.
- [ ] **Inköpslista**:
  - Dagens ingredienser läggs till i vald inköpslista.
  - Hela veckans ingredienser läggs till via header-knappen.
- [ ] **Kopiera vecka**: Kopiering av föregående veckas plan fungerar och ger toast-feedback.
- [ ] **Exportera**:
  - ICS-fil laddas ned och kan öppnas i kalenderapp.
  - JSON-export öppnar modal och kan kopieras till urklipp.
- [ ] **Mörkt läge (Dark mode)**: Kontrast, bakgrunder och ikoner är fullt läsbara och snygga.

---

### 🔹 Fas 6: Git Workflow (Prioritet 6)

1. **Skapa en feature-gren**:
   ```bash
   git checkout -b feature/mealplan-simplify-redesign
   ```
2. **Granska ändrade filer**:
   ```bash
   git status
   ```
3. **Commit**:
   ```bash
   git add src/components/MealPlanView.tsx src/locales/sv.json src/locales/en.json
   git commit -m "feat: simplify MealPlanView UI with color-coded meal types and streamlined actions"
   ```
4. **Push & Merge**:
   ```bash
   git push origin feature/mealplan-simplify-redesign
   ```

---

## 📊 Checklista för Genomförande

- [x] `MealPlanView.tsx` ombyggd med ren layout och färgkodning
- [x] Header och åtgärdsknappar strömlinjeformade
- [x] `sv.json` och `en.json` uppdaterade med kompletta nycklar
- [x] Modaler (`MealPlanEditModal`, `RandomMealModal`) verifierade och stilmatchade
- [x] `npm run validate` godkänd utan fel
- [x] `npm run test` godkänd (inklusive `MealPlanView.test.tsx`)
- [x] Merge till `main` och push genomförd

---

## ⏱️ Tidsuppskattning
- **Fas 1 (Analys & Setup)**: ~15 min
- **Fas 2 (Ombyggnad av MealPlanView)**: ~45 min
- **Fas 3 (i18n & översättningar)**: ~15 min
- **Fas 4 (Modalkonsistens)**: ~15 min
- **Fas 5 (Tester & Validering)**: ~20 min
- **Fas 6 (Git & Merge)**: ~15 min
- **Totalt uppskattad tid: ~2 timmar**

---

*Senast uppdaterad: 2026-08-31*
