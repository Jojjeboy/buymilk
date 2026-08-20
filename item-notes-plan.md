# Implementationsplan: Valfria anteckningar per vara i listan

Detta dokument beskriver olika förslag och designalternativ för att införa stöd för valfria anteckningar (t.ex. mängd, märke, specifik sort) på varje punkt i inköpslistan, inklusive datastruktur, gränssnitt och import/export.

---

## 1. Datastruktur

I `src/types/index.ts` utökas `Item`-interfacet med ett valfritt fält `note`:

```typescript
export interface Item {
  id: string;
  text: string;
  note?: string; // Valfri anteckning (t.ex. "3% fetthalt", "2 paket", "Eldorado")
  completed: boolean;
  state?: "unresolved" | "ongoing" | "completed";
  sectionId?: string;
  isPending?: boolean;
}
```

- **Bakåtkompatibilitet**: Befintliga varor i Firestore/lokal lagring utan `note` fortsätter fungera utan krav på datamigrering.

---

## 2. Gränssnitt (UI / UX) – Alternativ & Tillvägagångssätt

### Alternativ A: Inline subtext + direkt redigering (Valt alternativ)
- **Visning**:
  - Om en vara har en anteckning visas den som en diskret undertitel under varans namn (`text-xs text-gray-500 dark:text-gray-400 italic`).
  - Texten är klickbar för snabb inline-redigering.
- **Skapa / Redigera**:
  - En diskret anteckningsikon (`StickyNote` eller `FileText`) på raden bredvid kategoriknappen.
  - Klick på ikonen öppnar/visar ett inline-fält direkt under namnet med placeholder "Lägg till anteckning...".
  - Sparas automatiskt vid `onBlur` eller `Enter`. Om anteckningen töms tas den bort från varan.
- **Fördelar**:
  - Extremt snabbt och intuitivt på mobilen och skrivbordet utan extra popup-fönster eller navigation.

---

### Alternativ B: Snabbredigerings-modal / detaljkort
- **Visning**:
  - Anteckning visas som en liten "chip" eller undertitel under varans namn.
- **Skapa / Redigera**:
  - Klick på en redigeringsknapp eller långtryck öppnar en modal där man kan ställa in namn, anteckning och kategori i ett formulär med dedikerade fält.
- **Fördelar**:
  - Ger plats för fler framtida fält (t.ex. bild, länk, butik, förfallodatum).
- **Nackdelar**:
  - Kräver fler klick (öppna modal -> redigera -> spara/stäng).

---

### Alternativ C: Syntax-baserad inmatning ("Mjölk // 3% fett" eller parenteser)
- **Skapa**:
  - Vid tillägg i inputfältet kan man skriva `Mjölk // 3% fett` eller `Mjölk (3% fett)` så delas det automatiskt upp i `text: "Mjölk"` och `note: "3% fett"`.
- **Visning**:
  - Visas som undertitel på raden efter att varan skapats.
- **Fördelar**:
  - Mycket snabbt för power users som skriver snabbt på tangentbord.
- **Nackdelar**:
  - Kräver att användaren känner till syntaxen; behöver ändå ett manuellt redigeringsgränssnitt i efterhand.

---

## 3. Import & Export

### Export
- **Objektformat (`objects`)**:
  ```json
  [
    { "text": "Mjölk", "note": "3% fetthalt" },
    { "text": "Kaffe" }
  ]
  ```
  *(Om `note` är tom eller saknas utelämnas fältet för att hålla JSON ren).*
- **Inlindat format (`wrapped`)**:
  ```json
  {
    "items": [
      { "text": "Mjölk", "note": "3% fetthalt" },
      { "text": "Kaffe" }
    ]
  }
  ```
- **Enkelt format (`simple`)**:
  - `["Mjölk", "Kaffe"]` (eller `["Mjölk (3% fetthalt)", "Kaffe"]` om man vill baka in det).

### Import
Parsern (`parseJsonItems` och `handleImportJson`) hanterar:
1. `["Mjölk", "Kaffe"]` -> `{ text: "Mjölk" }`
2. `[{"text": "Mjölk", "note": "3% fett"}]` -> `{ text: "Mjölk", note: "3% fett" }`
3. `{"items": [{"text": "Mjölk", "note": "3% fett"}]}` -> `{ text: "Mjölk", note: "3% fett" }`
