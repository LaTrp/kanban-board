import { Router, Request, Response } from "express";
import { store } from "../models/store";

const router = Router();

// GET /api/boards
router.get("/", (_req: Request, res: Response) => {
  res.json(store.getBoards());
});

// GET /api/boards/:id  — full board with columns & cards
router.get("/:id", (req: Request, res: Response) => {
  const board = store.getBoard(req.params.id);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const columns = store.getColumns(board.id).map((col) => ({
    ...col,
    cards: store.getCards(col.id),
  }));

  res.json({ ...board, columns });
});

export default router;
