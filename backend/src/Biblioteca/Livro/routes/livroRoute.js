import { Router } from "express";
import livroController from "../controller/livroController.js";
import authMiddleware from "../../../middlewares/authMiddleware.js";

const router = Router();

// Aplicar autenticação em todas as rotas de livros
router.use(authMiddleware);

router.post("/", livroController.criar);
router.get("/", livroController.listar);
router.get("/:id", livroController.buscarPorId);
router.put("/:id", livroController.atualizar);
router.delete("/:id", livroController.deletar);

export default router;
