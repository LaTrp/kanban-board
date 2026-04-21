import { Board, Column, Card } from "./types";
import { v4 as uuid } from "uuid";

// In-memory store (swap for a real DB later)
const boards: Board[] = [{ id: "board-1", title: "My Project" }];

const columns: Column[] = [
  { id: "col-1", title: "To Do", boardId: "board-1", order: 0 },
  { id: "col-2", title: "In Progress", boardId: "board-1", order: 1 },
  { id: "col-3", title: "Done", boardId: "board-1", order: 2 },
];

const cards: Card[] = [
  {
    id: "card-1",
    title: "Set up project",
    description: "Initialize repo and install dependencies",
    columnId: "col-1",
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "card-2",
    title: "Design database schema",
    description: "Plan the data models for the app",
    columnId: "col-1",
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "card-3",
    title: "Build REST API",
    description: "Create Express routes for CRUD operations",
    columnId: "col-2",
    order: 0,
    createdAt: new Date().toISOString(),
  },
];

export const store = {
  // --- Boards ---
  getBoards: (): Board[] => boards,

  getBoard: (id: string): Board | undefined => boards.find((b) => b.id === id),

  // --- Columns ---
  getColumns: (boardId: string): Column[] =>
    columns
      .filter((c) => c.boardId === boardId)
      .sort((a, b) => a.order - b.order),

  createColumn: (boardId: string, title: string): Column => {
    const col: Column = {
      id: uuid(),
      title,
      boardId,
      order: columns.filter((c) => c.boardId === boardId).length,
    };
    columns.push(col);
    return col;
  },

  updateColumn: (id: string, title: string): Column | undefined => {
    const col = columns.find((c) => c.id === id);
    if (col) col.title = title;
    return col;
  },

  deleteColumn: (id: string): boolean => {
    const idx = columns.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    // Remove all cards in this column
    const colId = columns[idx].id;
    for (let i = cards.length - 1; i >= 0; i--) {
      if (cards[i].columnId === colId) cards.splice(i, 1);
    }
    columns.splice(idx, 1);
    return true;
  },

  // --- Cards ---
  getCards: (columnId: string): Card[] =>
    cards
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.order - b.order),

  getAllCards: (boardId: string): Card[] => {
    const colIds = columns
      .filter((c) => c.boardId === boardId)
      .map((c) => c.id);
    return cards.filter((c) => colIds.includes(c.columnId));
  },

  createCard: (columnId: string, title: string, description: string): Card => {
    const card: Card = {
      id: uuid(),
      title,
      description,
      columnId,
      order: cards.filter((c) => c.columnId === columnId).length,
      createdAt: new Date().toISOString(),
    };
    cards.push(card);
    return card;
  },

  updateCard: (
    id: string,
    updates: Partial<Pick<Card, "title" | "description">>,
  ): Card | undefined => {
    const card = cards.find((c) => c.id === id);
    if (!card) return undefined;
    if (updates.title !== undefined) card.title = updates.title;
    if (updates.description !== undefined)
      card.description = updates.description;
    return card;
  },

  moveCard: (
    cardId: string,
    targetColumnId: string,
    newOrder: number,
  ): Card | undefined => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return undefined;

    const oldColumnId = card.columnId;

    // Remove from old position — re-order old column
    const oldSiblings = cards
      .filter((c) => c.columnId === oldColumnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order);
    oldSiblings.forEach((c, i) => (c.order = i));

    // Insert into new column
    card.columnId = targetColumnId;
    const newSiblings = cards
      .filter((c) => c.columnId === targetColumnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order);

    // Shift cards to make room
    newSiblings.forEach((c) => {
      if (c.order >= newOrder) c.order++;
    });
    card.order = newOrder;

    return card;
  },

  deleteCard: (id: string): boolean => {
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    cards.splice(idx, 1);
    return true;
  },
};
