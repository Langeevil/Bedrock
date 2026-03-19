import { Router } from "express";
import projectController from "../controllers/projectController.js";
import autenticar from "../middlewares/authMiddleware.js";
import validateDto from "../middlewares/validateDto.js";
import { validateCreateProject } from "../dtos/projectDto.js";

const router = Router();

// Todas as rotas de projeto exigem autenticação
router.use(autenticar);

// Listar todos os projetos do usuário
router.get("/", projectController.listUserProjects);

// Criar um novo projeto
router.post("/", validateDto(validateCreateProject), projectController.createProject);

// Obter detalhes e dados do grafo de um projeto específico
router.get("/:id/graph", projectController.getProjectDetails);

export default router;
