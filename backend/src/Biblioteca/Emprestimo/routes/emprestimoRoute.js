import { Router } from "express";
import emprestimoController from "../controller/emprestimoController.js";

const router = Router();

router.post("/", emprestimoController.criar);
router.get("/", emprestimoController.listar);
router.get("/:id", emprestimoController.buscarPorId);
router.put("/:id", emprestimoController.atualizar);
router.delete("/:id", emprestimoController.deletar);

export default router;
