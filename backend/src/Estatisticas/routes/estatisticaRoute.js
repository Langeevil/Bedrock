import { Router } from "express";
import estatisticaController from "../controller/estatisticaController.js";

const router = Router();

router.get("/relatorio-nn", estatisticaController.getRelatorioNN);

export default router;
