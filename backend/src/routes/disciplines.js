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
import validateDto from "../middlewares/validateDto.js";
import { validateCreateDiscipline, validateUpdateDiscipline } from "../dtos/disciplineDto.js";

const router = express.Router();

router.get("/", authMiddleware, listarDisciplinas);
router.get("/:id", authMiddleware, buscarDisciplina);
router.post("/", authMiddleware, validateDto(validateCreateDiscipline), criarDisciplina);
router.put("/:id", authMiddleware, validateDto(validateUpdateDiscipline), atualizarDisciplina);
router.delete("/:id", authMiddleware, deletarDisciplina);

export default router;