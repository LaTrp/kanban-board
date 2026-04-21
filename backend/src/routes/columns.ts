import { Router, Request, Response } from "express";
import { store } from "../models/store";

const router = Router();

// POST /api/columns
router.post("/", (req: Request, res: Response) => {
  const { boardId, title } = req.body;
  if (!boardId || !title)
    return res.status(400).json({ error: "boardId and title are required" });
  const col = store.createColumn(boardId, title);
  res.status(201).json(col);
});

// PATCH /api/columns/:id
router.patch("/:id", (req: Request, res: Response) => {
  const { title } = req.body;
  const col = store.updateColumn(req.params.id, title);
  if (!col) return res.status(404).json({ error: "Column not found" });
  res.json(col);
});

// DELETE /api/columns/:id
router.delete("/:id", (req: Request, res: Response) => {
  const ok = store.deleteColumn(req.params.id);
  if (!ok) return res.status(404).json({ error: "Column not found" });
  res.status(204).send();
});

export default router;
