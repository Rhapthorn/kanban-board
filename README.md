# Kanban Project Workspace

A modern, production-ready Planning and Kanban Board application built from scratch using React, TypeScript, Tailwind CSS, and Zustand. Designed with a clean UI, full dark mode support, and smooth drag-and-drop mechanics.

---

## 🚀 Features

* **Columns & Board Management**: Create, rename, reorder, and delete columns dynamically with live completion percentage tracking and task counters.
* **Rich Task Cards**: Support for priorities (`low`, `medium`, `high`, `urgent`), tags, custom due dates, checklist subtasks, and Markdown-rendered descriptions.
* **Drag-and-Drop Engine**: Powered by `@hello-pangea/dnd` for smooth, isolated reordering of tasks across columns or shifting entire column layouts.
* **Real-time Search & Filtering**: Multi-select priority filtering combined with real-time title and description text search.
* **Persistence Layer**: Auto-saves state to `localStorage` via Zustand persist middleware.

---

## 🛠️ Tech Stack

* **Framework**: React (Functional Components & Hooks) + Vite
* **Language**: Strictly typed TypeScript
* **Styling**: Tailwind CSS (v4)
* **State Management**: Zustand
* **Drag & Drop**: `@hello-pangea/dnd`
* **Icons & Parsing**: `lucide-react`, `react-markdown`, `date-fns`

---

## 📦 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* JetBrains WebStorm (or your preferred IDE)

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/Rhapthorn/kanban-board.git](https://github.com/Rhapthorn/kanban-board.git)
   cd kanban-board
