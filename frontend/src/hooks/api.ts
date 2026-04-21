import { Board, Card, Column } from "../types";

const API = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Board
export const fetchBoard = (id: string) => request<Board>(`/boards/${id}`);

// Columns
export const createColumn = (boardId: string, title: string) =>
  request<Column>("/columns", {
    method: "POST",
    body: JSON.stringify({ boardId, title }),
  });

export const updateColumn = (id: string, title: string) =>
  request<Column>(`/columns/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

export const deleteColumn = (id: string) =>
  request<void>(`/columns/${id}`, { method: "DELETE" });

// Cards
export const createCard = (columnId: string, title: string, description = "") =>
  request<Card>("/cards", {
    method: "POST",
    body: JSON.stringify({ columnId, title, description }),
  });

export const updateCard = (
  id: string,
  data: Partial<Pick<Card, "title" | "description">>,
) =>
  request<Card>(`/cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const moveCard = (
  id: string,
  targetColumnId: string,
  newOrder: number,
) =>
  request<Card>(`/cards/${id}/move`, {
    method: "PATCH",
    body: JSON.stringify({ targetColumnId, newOrder }),
  });

export const deleteCard = (id: string) =>
  request<void>(`/cards/${id}`, { method: "DELETE" });
