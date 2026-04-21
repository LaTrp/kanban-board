import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  CollisionDetection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Board, Card } from "../types";
import * as api from "../hooks/api";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const BOARD_ID = "board-1";

// Custom collision detection that filters out the active (dragged) item
// from results, so a card doesn't collide with its own sortable droppable.
const kanbanCollisionDetection: CollisionDetection = (args) => {
  const activeId = args.active.id;

  // First: check what the pointer is inside of
  const pointerCollisions = pointerWithin(args);
  // Filter out the active item itself
  const filtered = pointerCollisions.filter((c) => c.id !== activeId);

  if (filtered.length > 0) {
    // Prefer column-level droppables when available (for cross-column moves)
    return [filtered[0]];
  }

  // Fallback: closestCenter, also filtering out active item
  const centerCollisions = closestCenter(args);
  return centerCollisions.filter((c) => c.id !== activeId);
};

const KanbanBoard: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const loadBoard = useCallback(async () => {
    try {
      const data = await api.fetchBoard(BOARD_ID);
      setBoard(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // --- Card CRUD ---
  const handleAddCard = async (
    columnId: string,
    title: string,
    description: string,
  ) => {
    await api.createCard(columnId, title, description);
    loadBoard();
  };

  const handleDeleteCard = async (id: string) => {
    await api.deleteCard(id);
    loadBoard();
  };

  const handleUpdateCard = async (
    id: string,
    title: string,
    description: string,
  ) => {
    await api.updateCard(id, { title, description });
    loadBoard();
  };

  // --- Column CRUD ---
  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      await api.createColumn(BOARD_ID, newColumnTitle.trim());
      setNewColumnTitle("");
      setAddingColumn(false);
      loadBoard();
    }
  };

  const handleDeleteColumn = async (id: string) => {
    await api.deleteColumn(id);
    loadBoard();
  };

  const handleUpdateColumn = async (id: string, title: string) => {
    await api.updateColumn(id, title);
    loadBoard();
  };

  // --- Drag & Drop ---
  // Keep a ref to always have the latest board state (avoids stale closures)
  const boardRef = useRef(board);
  boardRef.current = board;

  const findColumnInBoard = (b: Board, cardId: string) =>
    b.columns.find((col) => col.cards.some((c) => c.id === cardId)) ?? null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const b = boardRef.current;
    if (!b) return;
    const col = findColumnInBoard(b, active.id as string);
    if (col) {
      const card = col.cards.find((c) => c.id === active.id);
      if (card) setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // Do ALL logic inside setBoard to always work with latest state
    setBoard((prev) => {
      if (!prev) return prev;

      const activeCol = findColumnInBoard(prev, activeId);
      if (!activeCol) return prev;

      // Is "over" a column or a card?
      const isOverColumn = prev.columns.some((c) => c.id === overId);
      const overCol = isOverColumn
        ? prev.columns.find((c) => c.id === overId)!
        : findColumnInBoard(prev, overId);

      if (!overCol) return prev;

      // Same column — skip (reordering within column is handled in dragEnd)
      if (activeCol.id === overCol.id) return prev;

      // Clone columns
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      const srcCol = newColumns.find((c) => c.id === activeCol.id)!;
      const destCol = newColumns.find((c) => c.id === overCol.id)!;

      const cardIndex = srcCol.cards.findIndex((c) => c.id === activeId);
      if (cardIndex === -1) return prev;

      const [movedCard] = srcCol.cards.splice(cardIndex, 1);
      movedCard.columnId = destCol.id;

      if (isOverColumn) {
        // Dropped on the column itself (empty area) — add to end
        destCol.cards.push(movedCard);
      } else {
        const overIndex = destCol.cards.findIndex((c) => c.id === overId);
        if (overIndex < 0) {
          destCol.cards.push(movedCard);
        } else {
          // Insert before the hovered card
          destCol.cards.splice(overIndex, 0, movedCard);
        }
      }

      return { ...prev, columns: newColumns };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const b = boardRef.current;
    if (!b) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnInBoard(b, activeId);
    const isOverColumn = b.columns.some((c) => c.id === overId);
    const overCol = isOverColumn
      ? b.columns.find((c) => c.id === overId)!
      : findColumnInBoard(b, overId);

    if (!activeCol || !overCol) return;

    if (activeCol.id === overCol.id && !isOverColumn) {
      // Reorder within same column
      const col = b.columns.find((c) => c.id === activeCol.id)!;
      const oldIndex = col.cards.findIndex((c) => c.id === activeId);
      const newIndex = col.cards.findIndex((c) => c.id === overId);

      if (oldIndex !== newIndex && newIndex >= 0) {
        const reordered = arrayMove(col.cards, oldIndex, newIndex);
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === col.id ? { ...c, cards: reordered } : c,
            ),
          };
        });
        await api.moveCard(activeId, overCol.id, newIndex);
      }
    } else {
      // Card moved to different column (or dropped on a column directly)
      const targetColId = isOverColumn ? overId : overCol.id;
      const destCol = b.columns.find((c) => c.id === targetColId);
      const newIndex = destCol
        ? destCol.cards.findIndex((c) => c.id === activeId)
        : -1;
      await api.moveCard(activeId, targetColId, newIndex >= 0 ? newIndex : 0);
    }

    // Reload to get consistent state from server
    loadBoard();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-slate-400 text-lg">Loading board...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-red-400 text-lg">
          Error: {error}
          <button
            onClick={loadBoard}
            className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (!board) return null;

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">{board.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {board.columns.reduce((acc, c) => acc + c.cards.length, 0)} cards
            across {board.columns.length} columns
          </p>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-4 max-w-5xl mx-auto w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={kanbanCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 items-start h-full">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onUpdateCard={handleUpdateCard}
                onDeleteColumn={handleDeleteColumn}
                onUpdateColumn={handleUpdateColumn}
              />
            ))}

            {/* Add Column */}
            {addingColumn ? (
              <div className="bg-slate-800 rounded-lg min-w-[180px] p-2.5 space-y-2">
                <input
                  autoFocus
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setNewColumnTitle("");
                      setAddingColumn(false);
                    }
                  }}
                  placeholder="Column title..."
                  className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setNewColumnTitle("");
                      setAddingColumn(false);
                    }}
                    className="text-slate-400 hover:text-slate-300 text-xs px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="bg-slate-800/50 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg min-w-[180px] p-3 text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium"
              >
                + Add Column
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3">
                <KanbanCard
                  card={activeCard}
                  onDelete={() => {}}
                  onUpdate={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default KanbanBoard;
