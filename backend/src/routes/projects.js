import { Router } from "express";
import projectController from "../controllers/projectController.js";
import taskController from "../controllers/taskController.js";
import tagController from "../controllers/tagController.js";
import autenticar from "../middlewares/authMiddleware.js";
import validateDto from "../middlewares/validateDto.js";
import { validateCreateProject } from "../dtos/projectDto.js";

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticar);

// ── Projetos ──────────────────────────────────────────────────────────────────
router.get("/",    projectController.listUserProjects);
router.post("/",   validateDto(validateCreateProject), projectController.createProject);
router.get("/:id/graph", projectController.getProjectDetails);

// ── Tarefas ───────────────────────────────────────────────────────────────────
router.get( "/:projectId/tasks",          taskController.listTasks);
router.post("/:projectId/tasks",          taskController.createTask);
router.put( "/:projectId/tasks/:taskId",  taskController.updateTask);
router.delete("/:projectId/tasks/:taskId", taskController.deleteTask);

// ── Tags ──────────────────────────────────────────────────────────────────────
router.get(   "/:projectId/tags",        tagController.listTags);
router.post(  "/:projectId/tags",        tagController.createTag);
router.delete("/:projectId/tags/:tagId", tagController.deleteTag);

export default router;