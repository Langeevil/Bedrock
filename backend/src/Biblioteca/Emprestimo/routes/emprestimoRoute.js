import { Router } from "express";
import emprestimoController from "../controller/emprestimoController.js";
import { autenticar } from "../../../middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas de empréstimo requerem autenticação
router.use(autenticar);

router.post("/", emprestimoController.criar);
router.get("/", emprestimoController.listar);
router.get("/:id", emprestimoController.buscarPorId);
router.put("/:id", emprestimoController.atualizar);
router.delete("/:id", emprestimoController.deletar);

export default router;
