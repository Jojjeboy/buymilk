# 📋 Förbättringsplan för Användarflöden i BuyMilk

Detta dokument beskriver nulägesanalys och en steg-för-steg-plan för att göra appens tre huvudflöden logiska, intuitiva och sömlösa.

---

## 🎯 De Tre Huvudflödena

1. **Flöde 1 – Måltidsplanering & Inköp:**  
   *Planera måltider → Få inspiration → Välja måltid → Få ingredienser i inköpslistan med smart avstämning.*
2. **Flöde 2 – Snabbvaruinköp:**  
   *Snabbt och enkelt lägga in varor direkt i inköpslistan.*
3. **Flöde 3 – Recept- & Måltidshantering:**  
   *Smidigt skapa, redigera, importera och organisera recept/måltider.*

---

## 📑 Steg-för-steg Implementeringsplan

---

### Fas 1: Inspiration & Måltidsval vid Planering

Förbättra modalen när man väljer vad som ska ätas för en specifik dag så att användaren kan söka, filtrera på taggar, se bilder och bläddra bland förslag.

- [ ] **1.1 Uppgradera `MealPlanEditModal` med flikar och filter**
  - [ ] Lägg till en flik för **Mina Recept / Favoriter** och en flik för **Inspiration / Förslag**.
  - [ ] Lägg till tagg-filter (t.ex. *Snabbt*, *Vegetariskt*, *Fisk*, *Kött*, *Barnvänligt*, *Pasta*).
  - [ ] Visa receptkort med bild, taggar och antal ingredienser istället för enbart ren text.
  - [ ] Tillåt fortfarande fri textinmatning för snabba anteckningar (t.ex. "Äta ute" eller "Rester").
- [ ] **1.2 Integrera och förbättra `RandomMealModal`**
  - [ ] Koppla på tagg- och kategorifiltrering direkt i slumpmodalen när den öppnas från matsedeln.
  - [ ] Ge direktknapp för att se hela receptet/ingredienserna innan man väljer det.
- [ ] **1.3 Snabbval och återanvändning**
  - [ ] Lägg till sektion för "Senast lagade" eller "Ofta lagade" måltider i urvalet.

---

### Fas 2: Smart Ingrediensöverföring till Inköpslistan

Gör så att användaren har full kontroll över vilka ingredienser som hamnar i listan, så att basvaror som redan finns hemma inte skräpar ner inköpslistan.

- [ ] **2.1 Skapa `IngredientSelectionModal` (Avstämningsmodal)**
  - [ ] När användaren klickar på "Lägg till ingredienser" (för en dag eller hela veckan), öppna en förhandsgranskning/checklista.
  - [ ] Alla ingredienser visas förkryssade som standard (förutom de som redan är markerade med `checkIfExistAtHome`).
  - [ ] Användaren kan snabbt bocka av varor de redan har hemma med ett klick.
  - [ ] Lägg till knapp: *"Bocka av alla basvaror"* eller *"Kolla hemma"*.
- [ ] **2.2 Ingredienssummering & sammanslagning**
  - [ ] Om två måltider samma vecka kräver t.ex. lök eller grädde, slå ihop eller gruppera ingredienserna logiskt.
- [ ] **2.3 Snabbingredienser för fritexträtter**
  - [ ] Om användaren skrivit en fritexträtt (ej kopplad till ett recept), erbjud en snabbknapp: *"Lägg till ingredienser till denna rätt"*.

---

### Fas 3: Sammanhållet Receptskapande & Begreppsharmonisering

Gör det enkelt och inbjudande att spara nya recept i ett enda sammanhängande flöde.

- [ ] **3.1 Skapa en enhetlig "Skapa/Redigera Recept"-modal (`RecipeEditModal`)**
  - [ ] Ersätt det fragmenterade flödet (namnfält → separat redigera-modal → separat ingrediens-modal).
  - [ ] Samla namn, beskrivning, bild, portioner, taggar, ingredienslista och tillagningssteg i ett enda snyggt steg-för-steg- eller flikformulär.
  - [ ] Integrera snabbimport av ingredienser (text/JSON) direkt i samma formulär.
- [ ] **3.2 Konsolidera detaljmodaler (`MealDetailModal` och `RecipeDetailModal`)**
  - [ ] Slå samman `RecipeDetailModal` och `MealDetailModal` till en gemensam `MealDetailModal`.
  - [ ] Säkerställ att detaljvyn har tydliga åtgärder:
    - [ ] *Planera in i matsedel* (öppnar dagväljare).
    - [ ] *Lägg ingredienser i inköpslista* (öppnar ingrediensavstämning).
    - [ ] *Redigera recept*.
    - [ ] *Favoritmarkera*.
- [ ] **3.3 Enhetlig terminologi i gränssnittet**
  - [ ] Synkronisera svensk och engelsk översättning så att "Måltider", "Recept" och "Favoriter" används konsekvent i menyer och knappar.

---

### Fas 4: Mobilnavigering & Snabbvaruinköp (Snabbflödet)

Optimera appens layout så att den är blixtsnabb att använda på mobilen med en hand.

- [ ] **4.1 Mobil Bottennavigering (Bottom Tab Bar)**
  - [ ] Skapa en fast meny i botten på mobilen för de tre primära flödena:
    1. **Inköp** 🛒 (`/`)
    2. **Matsedel** 📅 (`/mealplan`)
    3. **Recept** 📖 (`/meals`)
    4. **Mer / Inställningar** ⚙️ (`/settings` eller meny)
  - [ ] Behåll desktop-sidomenyn intakt för större skärmar.
- [ ] **4.2 Snabbfavoriter i inköpslistan**
  - [ ] Lägg till en horisontell scroll-rad ovanför inmatningsfältet med "Vanliga varor" (t.ex. *Mjölk*, *Smör*, *Ägg*, *Bananer*) för 1-klicks-tillägg utan att behöva skriva.
- [ ] **4.3 Tydligare länkning mellan Inköpslista och Matsedel**
  - [ ] Gör "Nästa måltid"-bannern i inköpslistan klickbar för att snabbt hoppa till veckans matsedel eller se kvällens recept.

---

## 📂 Berörda Filer & Komponenter

| Komponent / Fil | Beskrivning & Förändring |
| :--- | :--- |
| `src/components/MealPlanView.tsx` | Koppla ihop med ny ingrediensavstämning och förbättrad inspirationsväljare. |
| `src/components/MealPlanEditModal.tsx` | Göra om till inspirations- och receptväljare med sök, filter och kortvy. |
| `src/components/RandomMealModal.tsx` | Koppla in taggfilter och receptgranskning. |
| `src/components/MealDetailModal.tsx` | Ersätta `RecipeDetailModal` och bli den gemensamma receptvisaren. |
| `src/components/MealEditModal.tsx` | Bygga ut till ett komplett receptskapande formulär. |
| `src/components/IngredientSelectionModal.tsx` *(Ny)* | Modal för att bocka av ingredienser innan de läggs till i inköpslistan. |
| `src/components/Layout.tsx` | Lägga till Bottom Navigation Bar för mobila enheter. |
| `src/components/GroceryListView.tsx` | Integrera snabbknappar för vanliga varor och navigation till matsedel. |
| `src/locales/sv.json` & `en.json` | Harmonisera recept- och måltidstermer. |

---

*Planen skapad: 2026-09-02*
