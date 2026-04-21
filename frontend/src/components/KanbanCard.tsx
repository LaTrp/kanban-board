import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "../types";

interface Props {
  card: CardType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, description: string) => void;
}

const KanbanCard: React.FC<Props> = ({ card, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(card.id, title.trim(), description.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setTitle(card.title);
      setDescription(card.description);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-700 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing group"
      {...attributes}
      {...listeners}
    >
      {isEditing ? (
        <div
          className="space-y-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-600 text-white text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Description..."
            className="w-full bg-slate-600 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTitle(card.title);
                setDescription(card.description);
                setIsEditing(false);
              }}
              className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-white leading-snug">
              {card.title}
            </h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-blue-400 text-xs p-0.5"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-red-400 text-xs p-0.5"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
          {card.description && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {card.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KanbanCard;
