Implementationsplan: Länka/Gruppera Flera Listor
Bakgrund
För närvarande har appen en hierarki: Category → List → Item. Användaren vill kunna indikera att flera listor ska genomföras tillsammans, så att det blir tydligt att det inte bara är en enskild lista som ska slutföras.

Tre Alternativ
Alternativ 1: List Groups (Ny Hierarkinivå)
Koncept: Skapa en ny entitet "List Group" som är en samling av listor. Detta blir en mellannivå mellan Category och List.

Strukturförändring
Category
  └─ List Group (NYT)
       └─ List
            └─ Item
Datamodell
Ny typ i 
types/index.ts
:

export interface ListGroup {
    id: string;
    name: string;
    categoryId: string;
    listIds: string[]; // Referenser till listor som ingår i gruppen
    order?: number;
}
En lista kan antingen tillhöra en grupp ELLER vara fristående:

export interface List {
    id: string;
    name: string;
    items: Item[];
    categoryId: string;
    groupId?: string; // OPTIONAL: referens till ListGroup
    order?: number;
}
UI-ändringar
CategoryDetail-vyn:

Visa två sektioner: "Grupperade Listor" och "Enskilda Listor"
Varje List Group visas som ett expanderbart kort
När kollapsad: visa gruppnamn + sammanlagd progress (t.ex. "12/25 klara")
När expanderad: visa alla ingående listor som nestade kort
Ny vy: GroupDetail:

Visar alla listor i gruppen
Möjlighet att checka av items från alla listor på samma ställe
"Slutför alla"-knapp som återställer alla listor i gruppen
För- och Nackdelar
✅ Fördelar:

Tydlig hierarki och struktur
Kan ha namn på grupper (t.ex. "Semesterförberedelser")
Enkelt att se progress för hela gruppen
Listor kan fortfarande vara fristående
❌ Nackdelar:

Mest komplex implementation av de tre alternativen
Kräver ny datamodell och nya vyer
Listor kan bara tillhöra EN grupp åt gången
Mer klick för att nå individuella listor
Alternativ 2: List Tags/Labels (Flexibel Taggning)
Koncept: Låt listor ha en eller flera "tags" som fungerar som etiketter. Användaren kan filtrera på tag för att se alla relaterade listor.

Strukturförändring
Ingen hierarki-förändring, bara metadata på listor:

export interface List {
    id: string;
    name: string;
    items: Item[];
    categoryId: string;
    tags?: string[]; // Array av tag-namn
    order?: number;
}
UI-ändringar
CategoryDetail-vyn:

Varje listkort visar sina tags som färgglada badges
Filterbar dropdown högst upp: "Visa alla" / "Semester" / "Veckorutin" etc.
När en tag är vald: visa endast listor med den taggen
Indikator: "3 listor med tag 'Semester'"
ListDetail-vyn:

Möjlighet att lägga till/ta bort tags på listan
Autocomplete för befintliga tags
Ny "Tag Manager" i Settings:

Se alla tags som finns
Byta namn på tags (påverkar alla listor)
Radera tags
Se hur många listor som använder varje tag
För- och Nackdelar
✅ Fördelar:

Mycket flexibel: listor kan ha flera tags
Ingen komplex hierarki
Lätt att filtrera och hitta relaterade listor
Minimal datamodell-förändring
❌ Nackdelar:

Ingen tydlig "completion"-status för en grupp av listor
Användaren måste komma ihåg att filtrera på tag
Kan bli rörigt om många tags skapas
Mindre tydlig koppling än en explicit grupp
Alternativ 3: Master/Checklist Meta-Lists (Lista av Listor)
Koncept: Skapa en speciell typ av "meta-lista" vars items är länkar till andra listor istället för vanliga todos. Detta är som en "checklist av checklistor".

Strukturförändring
Utöka 
Item
 med en optional referens:

export interface Item {
    id: string;
    text: string;
    completed: boolean;
    linkedListId?: string; // OPTIONAL: referens till annan lista
}
Lägg till en flag på 
List
:

export interface List {
    id: string;
    name: string;
    items: Item[];
    categoryId: string;
    isMetaList?: boolean; // Flagga: är detta en "lista av listor"?
    order?: number;
}
UI-ändringar
Skapa Meta-Lista:

När användaren skapar en ny lista: checkbox "Detta är en master-checklista"
Om meta-list: speciell UI för att lägga till "list-items" istället för vanliga items
Varje item i meta-listan är en länk/knapp till en annan lista
ListDetail för Meta-List:

Varje item visar:
Listans namn som item-text
Progress-indikator (t.ex. "8/12 klara" som badge)
Klickbar länk till listan
Checkbox som checkas automatiskt när ALLA items i den länkade listan är klara
"Slutför alla"-knapp: navigerar genom alla länkade listor och återställer dem
Regular List:

Indikator längst upp om listan är länkad från en meta-list: "Del av: Semesterförberedelser →"
För- och Nackdelar
✅ Fördelar:

Intuitivt: en checklista av checklistor
Tydlig completion-status för varje "sub-lista"
Återanvänder befintlig list-mekanik
Visuellt tydligt vilka listor som hör ihop
❌ Nackdelar:

Något udda koncept (lista som refererar till andra listor)
Kräver speciell hantering av "meta vs vanlig" lista
Risk för cirkulära referenser (lista A länkar till lista B som länkar till lista A)
Kan bli komplext om man vill redigera items direkt från meta-vyn
Verifieringsplan
För alla alternativ:
Funktionell verifiering:

Skapa en grupp/tagg/meta-lista med 3 listor
Genomför alla listor (checka av alla items)
Verifiera att kopplad status uppdateras korrekt
Testa att radera en lista som är kopplad till grupp/tagg/meta-list
Verifiera att data sparas till Firestore och synkar mellan enheter
UI/UX-verifiering:

Visuell inspektion av nya komponenter i både ljust och mörkt läge
Testa på mobil viewport (320px bred)
Verifiera att drag-and-drop fortfarande fungerar
Kontrollera att befintliga listor (utan gruppering) fortfarande fungerar som förväntat
Kodkvalitet:

npm run build - inga errors
npm run lint - inga errors
npm run test - alla tester passerar
Rekommendation (från AI)
Jag rekommenderar Alternativ 2: Tags/Labels som ett första steg, av följande skäl:

Minst invasivt: Minimal förändring av befintlig struktur
Flexibilitet: Listor kan ha flera tags, så du kan ha överlappande grupperingar
Snabbast att implementera: Kräver huvudsakligen UI-ändringar, inte ny hierarki
Framtidssäker: Kan kombineras med Alternativ 1 senare om behov uppstår
Om behov är mer explicit "en samling listor ska alltid genomföras tillsammans", då är Alternativ 3: Meta-Lists mer intuitivt.

Om du vill ha strikt hierarki och gruppnamn är viktiga, välj Alternativ 1: List Groups.

Nästa Steg
Användarens input: Svara på följdfrågorna ovan
Välj alternativ: Vilket alternativ passar bäst för ditt use case?
Förfina: Jag kan utveckla det valda alternativet till en detaljerad implementation plan
Genomföra: Koda förändringarna enligt planen