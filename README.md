[project_readme (2).md](https://github.com/user-attachments/files/34581409/project_readme.2.md)
# ⚡ Modern SaaS Kanban Board Architecture

A high-performance, keyboard-centric Kanban board built with React, TypeScript, Tailwind CSS, Zustand, and `@hello-pangea/dnd`. Designed with a dark-mode ambient UI, glassmorphism, smooth animations, and zero-latency local state persistence.

---

## ✨ Features

- 🎨 **Ambient SaaS UI/UX**: SVG dot-grid background, smooth glassmorphism headers, dark/light theme toggling, and Framer Motion modal/drawer transitions.
- 🎯 **Drag & Drop Workflow**: Fluid reordering for both tasks and board columns using `@hello-pangea/dnd`.
- ⚡ **Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant search across all tasks, priority levels, and system operations with keyboard arrow navigation.
- ⌨️ **Global Hotkeys**: Quick `Alt+Key` shortcuts operating globally across the app:
  - `Alt + N`: Create new task
  - `Alt + T`: Toggle dark/light theme
  - `Alt + A`: Open Archive drawer
  - `Alt + E`: Export JSON backup
  - `Alt + I`: Import JSON backup
  - `Alt + C`: Clear active filters
- 📦 **Smart Archive & Restore**: Non-destructive task archiving with column memory (`originalColumnId`), allowing tasks to restore directly back to their original stage.
- 🎨 **Column Color Themes**: Custom color badges for custom stages, with a locked **Emerald** theme reserved for the `Done` column to ensure clear visual analytics.
- 📊 **Real-Time Analytics & Smart Completion**:
  - Top header task count, completed count, and overdue indicators.
  - 1-click completion checkmark that auto-moves cards to/from the `Done` column.
  - Relative due dates (*"Due Today"*, *"Due Tomorrow"*, *"Overdue by Xd"*).
  - Visual subtask progress bars directly on cards.
- 🍞 **Toast Notification System**: Interactive floating toast alerts with a 5-second `Undo` action for quick restoration of accidental archives.
- 💾 **Data Portability & Storage**: LocalStorage persistence powered by Zustand, with full timestamped JSON export and import capabilities.

---

## 🛠️ Tech Stack

- **Framework**: React 18 / Vite
- **Language**: TypeScript
- **State Management**: Zustand (`persist` middleware)
- **Styling**: Tailwind CSS (v4)
- **Drag and Drop**: `@hello-pangea/dnd`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Utilities**: `date-fns`
- **Markdown Parsing**: `react-markdown`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm** / **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kanban-board.git
   cd kanban-board
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Toggle Command Palette / Quick Search |
| `Alt + N` | Create New Task |
| `Alt + T` | Toggle Light / Dark Mode |
| `Alt + A` | Open Archive Drawer |
| `Alt + E` | Export Board Backup (`.json`) |
| `Alt + I` | Import Board Backup (`.json`) |
| `Alt + C` | Clear All Active Filters |
| `Esc` | Close Modals / Command Palette |

---

## 📂 Project Structure

```text
src/
├── components/
│   └── board/
│       ├── ArchiveModal.tsx      # Slide-over archive drawer component
│       ├── BoardColumn.tsx       # Droppable Kanban column container
│       ├── CommandPalette.tsx    # Ctrl+K modal & quick search
│       ├── KanbanBoard.tsx       # Master workspace layout & global listeners
│       ├── TaskCard.tsx          # Draggable card item with progress bar
│       ├── TaskModal.tsx         # Create / Edit task form modal
│       └── ToastContainer.tsx    # Floating toast notifications & Undo system
├── store/
│   └── useBoardStore.ts          # Zustand store with LocalStorage persistence
├── types/
│   └── board.ts                  # TypeScript definitions (Task, Column, State)
├── index.css                     # Tailwind v4 directives & custom scrollbars
└── main.tsx                      # Application entry point
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
