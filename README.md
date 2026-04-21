# Kanban Board

A fullstack Kanban board application with drag-and-drop functionality, built with React, TypeScript, Tailwind CSS, and Express.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Tech Stack](https://img.shields.io/badge/Tailwind-3-blue) ![Tech Stack](https://img.shields.io/badge/Express-4-green)

## Features

- **Drag & Drop** — Move cards between columns using [@dnd-kit](https://dndkit.com/)
- **CRUD Operations** — Create, edit, and delete columns and cards
- **Responsive UI** — Clean dark-themed interface with Tailwind CSS
- **REST API** — Express backend with typed routes
- **Optimistic Updates** — UI updates immediately, syncs with server

## Tech Stack

| Frontend     | Backend         |
| ------------ | --------------- |
| React 18     | Express 4       |
| TypeScript   | TypeScript      |
| Tailwind CSS | In-memory store |
| @dnd-kit     | REST API        |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/LaTrp/kanban-board.git
cd kanban-board

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running

```bash
# Terminal 1 — Start the backend (port 4000)
cd backend
npm run dev

# Terminal 2 — Start the frontend (port 3000)
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## API Endpoints

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/api/boards`         | List all boards                |
| GET    | `/api/boards/:id`     | Get board with columns & cards |
| POST   | `/api/columns`        | Create a column                |
| PATCH  | `/api/columns/:id`    | Update column title            |
| DELETE | `/api/columns/:id`    | Delete a column                |
| POST   | `/api/cards`          | Create a card                  |
| PATCH  | `/api/cards/:id`      | Update card title/description  |
| PATCH  | `/api/cards/:id/move` | Move card to another column    |
| DELETE | `/api/cards/:id`      | Delete a card                  |

## Project Structure

```
kanban-board/
├── backend/
│   └── src/
│       ├── server.ts          # Express app entry point
│       ├── models/
│       │   ├── types.ts       # TypeScript interfaces
│       │   └── store.ts       # In-memory data store
│       └── routes/
│           ├── boards.ts      # Board endpoints
│           ├── columns.ts     # Column endpoints
│           └── cards.ts       # Card endpoints
└── frontend/
    └── src/
        ├── App.tsx
        ├── types/index.ts     # Shared types
        ├── hooks/api.ts       # API client
        └── components/
            ├── KanbanBoard.tsx # Main board + DnD context
            ├── KanbanColumn.tsx# Droppable column
            └── KanbanCard.tsx  # Draggable card
```

## Future Improvements

- [ ] Persistent database (PostgreSQL / MongoDB)
- [ ] User authentication
- [ ] Real-time updates with WebSockets
- [ ] Card labels, due dates, and assignees
- [ ] Board creation and switching
