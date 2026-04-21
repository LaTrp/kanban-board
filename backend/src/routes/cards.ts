import { Router, Request, Response } from "express";
import { store } from "../models/store";

const router = Router();

// POST /api/cards
router.post("/", (req: Request, res: Response) => {
  const { columnId, title, description = "" } = req.body;
  if (!columnId || !title)
    return res.status(400).json({ error: "columnId and title are required" });
  const card = store.createCard(columnId, title, description);
  res.status(201).json(card);
});

// PATCH /api/cards/:id
router.patch("/:id", (req: Request, res: Response) => {
  const card = store.updateCard(req.params.id, req.body);
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// PATCH /api/cards/:id/move
router.patch("/:id/move", (req: Request, res: Response) => {
  const { targetColumnId, newOrder } = req.body;
  if (!targetColumnId || newOrder === undefined)
    return res
      .status(400)
      .json({ error: "targetColumnId and newOrder are required" });
  const card = store.moveCard(req.params.id, targetColumnId, newOrder);
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// DELETE /api/cards/:id
router.delete("/:id", (req: Request, res: Response) => {
  const ok = store.deleteCard(req.params.id);
  if (!ok) return res.status(404).json({ error: "Card not found" });
  res.status(204).send();
});

export default router;
