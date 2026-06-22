# BuyMilk 🥛

BuyMilk is a modern, intuitive grocery list application designed to make shopping efficient and organized. It features real-time synchronization, a clean user interface, and an intelligent auto-grouping system.

## 🚀 Key Features

- **Real-time Sync**: Keep your lists updated across all devices.
- **Intelligent Auto-grouping**: Items are automatically sorted into aisles (categories) as you add them.
- **Customizable Aisles**: Define your own categories and keywords to match your preferred store layout.
- **Product History**: Smart autocomplete based on your most frequently added items.
- **Calendar Integration**: Schedule your shopping trips with Google Calendar integration.
- **Multi-language Support**: Full support for English and Swedish.
- **PWA Ready**: Install it as a progressive web app for a native-like experience.

## 🛒 Aisle Templates & Auto-grouping

One of the standout features of BuyMilk is the **Auto-grouping** system. Instead of manually assigning every item to a category, BuyMilk does the heavy lifting for you.

### How it Works
When you add an item (e.g., "Apple"), the app scans the item's text against a set of **Aisle Templates**. Each template consists of a category name and a list of associated keywords. If a match is found, the item is automatically grouped under that aisle.

**Example:**
- **Aisle**: `Produce` $\rightarrow$ **Keywords**: `apple, banana, broccoli, spinach...`
- **Aisle**: `Dairy` $\rightarrow$ **Keywords**: `milk, cheese, butter, yogurt...`

### Managing Your Aisles
You can fully customize this behavior in the **Settings** view:
- **Add New Aisles**: Create custom categories for specific stores or needs.
- **Edit Keywords**: Refine which words trigger a specific category to improve accuracy.
- **Delete Categories**: Remove aisles you no longer need.

This functionality ensures that your grocery list is always organized by store section, reducing the time spent walking back and forth across the store.

## 🛠️ Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Backend/Database**: Firebase (Firestore & Auth)
- **Internationalization**: react-i18next
- **Build Tool**: Vite

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Jojjeboy/buymilk.git
   cd buymilk
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.