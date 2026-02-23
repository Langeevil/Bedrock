import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  listDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
} from "../controllers/disciplinesController.js";

const router = express.Router();

router.get("/", authMiddleware, listDisciplines);
router.post("/", authMiddleware, createDiscipline);
router.put("/:id", authMiddleware, updateDiscipline);
router.delete("/:id", authMiddleware, deleteDiscipline);

export default router;
