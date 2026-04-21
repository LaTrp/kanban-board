import React, { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType } from "../types";
import KanbanCard from "./KanbanCard";

interface Props {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard: (id: string, title: string, description: string) => void;
  onDeleteColumn: (id: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
}

const KanbanColumn: React.FC<Props> = ({
  column,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onDeleteColumn,
  onUpdateColumn,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  };

  const handleSaveTitle = () => {
    if (columnTitle.trim()) {
      onUpdateColumn(column.id, columnTitle.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-slate-800 rounded-lg min-w-[180px] flex flex-col max-h-[calc(100vh-6rem)]"
    >
      {/* Column Header */}
      <div className="px-2.5 py-2 flex items-center justify-between">
        {isEditingTitle ? (
          <input
            autoFocus
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setColumnTitle(column.title);
                setIsEditingTitle(false);
              }
            }}
            className="bg-slate-700 text-white font-semibold text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 w-full mr-2"
          />
        ) : (
          <h3
            onClick={() => setIsEditingTitle(true)}
            className="font-semibold text-sm text-slate-200 cursor-pointer hover:text-white flex items-center gap-2"
          >
            {column.title}
            <span className="bg-slate-700 text-slate-400 text-xs px-1.5 py-0.5 rounded-full">
              {column.cards.length}
            </span>
          </h3>
        )}
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="text-slate-500 hover:text-red-400 transition-colors text-sm p-1"
          title="Delete column"
        >
          ×
        </button>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto px-2.5 pb-2 space-y-1.5 kanban-scroll min-h-[80px]"
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onUpdate={onUpdateCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="px-2.5 pb-2 pt-0">
        {isAddingCard ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCard();
                if (e.key === "Escape") {
                  setNewCardTitle("");
                  setIsAddingCard(false);
                }
              }}
              placeholder="Enter card title..."
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => {
                  setNewCardTitle("");
                  setIsAddingCard(false);
                }}
                className="text-slate-400 hover:text-slate-300 text-xs px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full text-left text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg px-3 py-2 transition-colors"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
