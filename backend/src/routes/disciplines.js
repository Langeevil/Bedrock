// routes/disciplines.js
import express from "express";
import {
  listarDisciplinas,
  buscarDisciplina,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
} from "../controllers/disciplinesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",       authMiddleware, listarDisciplinas);
router.get("/:id",    authMiddleware, buscarDisciplina);
router.post("/",      authMiddleware, criarDisciplina);
router.put("/:id",    authMiddleware, atualizarDisciplina);
router.delete("/:id", authMiddleware, deletarDisciplina);

export default router;