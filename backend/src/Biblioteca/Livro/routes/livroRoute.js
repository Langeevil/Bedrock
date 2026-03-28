import { Router } from "express";
import livroController from "../controller/livroController.js";

const router = Router();

router.post("/", livroController.criar);
router.get("/", livroController.listar);
router.get("/:id", livroController.buscarPorId);
router.put("/:id", livroController.atualizar);
router.delete("/:id", livroController.deletar);

export default router;
