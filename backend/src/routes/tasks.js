import express from "express";
import * as controller from "../controllers/disciplineTaskController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// ===== TAREFAS =====

// GET /api/disciplines/:disciplineId/tasks
router.get("/:disciplineId/tasks", controller.listTasks);

// GET /api/disciplines/:disciplineId/tasks/:taskId
router.get("/:disciplineId/tasks/:taskId", controller.getTask);

// POST /api/disciplines/:disciplineId/tasks
router.post("/:disciplineId/tasks", controller.createTask);

// PUT /api/disciplines/:disciplineId/tasks/:taskId
router.put("/:disciplineId/tasks/:taskId", controller.updateTask);

// DELETE /api/disciplines/:disciplineId/tasks/:taskId
router.delete("/:disciplineId/tasks/:taskId", controller.deleteTask);

// ===== ARQUIVOS DE TAREFAS =====

// POST /api/disciplines/:disciplineId/tasks/:taskId/files
router.post(
  "/:disciplineId/tasks/:taskId/files",
  upload.single("file"),
  controller.addTaskFile
);

// DELETE /api/disciplines/:disciplineId/tasks/:taskId/files/:fileId
router.delete("/:disciplineId/tasks/:taskId/files/:fileId", controller.deleteTaskFile);

// ===== SUBMISSÕES =====

// POST /api/disciplines/:disciplineId/tasks/:taskId/submit
router.post("/:disciplineId/tasks/:taskId/submit", controller.submitTask);

// POST /api/disciplines/:disciplineId/tasks/:taskId/complete
router.post("/:disciplineId/tasks/:taskId/complete", controller.completeTask);

// ===== ARQUIVOS DE SUBMISSÃO =====

// POST /api/disciplines/:disciplineId/tasks/:taskId/submissions/:submissionId/files
router.post(
  "/:disciplineId/tasks/:taskId/submissions/:submissionId/files",
  upload.single("file"),
  controller.addSubmissionFile
);

// DELETE /api/disciplines/:disciplineId/tasks/:taskId/submissions/:submissionId/files/:fileId
router.delete(
  "/:disciplineId/tasks/:taskId/submissions/:submissionId/files/:fileId",
  controller.deleteSubmissionFile
);

// GET /api/disciplines/:disciplineId/submissions/:submissionId
router.get("/:disciplineId/submissions/:submissionId", controller.getSubmission);

// PUT /api/disciplines/:disciplineId/tasks/:taskId/submissions/:submissionId/grade
router.put(
  "/:disciplineId/tasks/:taskId/submissions/:submissionId/grade",
  controller.gradeSubmission
);

export default router;
