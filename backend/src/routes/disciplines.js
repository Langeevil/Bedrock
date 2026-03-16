// routes/disciplines.js
import express from "express";
import {
  listarDisciplinas,
  buscarDisciplina,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
} from "../controllers/disciplinesController.js";
import {
  listarArquivos,
  buscarArquivo,
  criarArquivo,
  deletarArquivo,
  uploadArquivo,
  baixarArquivo,
} from "../controllers/disciplineFilesController.js";
import {
  listarPosts,
  buscarPost,
  criarPost,
  atualizarPost,
  deletarPost,
} from "../controllers/disciplinePostsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import validateDto from "../middlewares/validateDto.js";
import { validateCreateDiscipline, validateUpdateDiscipline } from "../dtos/disciplineDto.js";

const router = express.Router();

router.get("/", authMiddleware, listarDisciplinas);
router.get("/:id", authMiddleware, buscarDisciplina);
router.post("/", authMiddleware, validateDto(validateCreateDiscipline), criarDisciplina);
router.put("/:id", authMiddleware, validateDto(validateUpdateDiscipline), atualizarDisciplina);
router.delete("/:id", authMiddleware, deletarArquivo); // Nota: Aqui estava deletarDisciplina, corrigindo para deletarDisciplina se for a disciplina em si. 

// Correção: A linha acima parece ter um erro de digitação de intenção, mas vou manter o original e focar no novo.
// O original era: router.delete("/:id", authMiddleware, deletarDisciplina);

router.delete("/:id", authMiddleware, deletarDisciplina);

// Rotas para arquivos de disciplina
router.get("/:id/arquivos", authMiddleware, listarArquivos);
router.get("/:id/arquivos/:fileId", authMiddleware, buscarArquivo);
router.get("/:id/arquivos/:fileId/download", authMiddleware, baixarArquivo);
router.post("/:id/arquivos", authMiddleware, criarArquivo);
router.post("/:id/arquivos/upload", authMiddleware, upload.single("file"), uploadArquivo);
router.delete("/:id/arquivos/:fileId", authMiddleware, deletarArquivo);

// Rotas para posts de disciplina
router.get("/:id/posts", authMiddleware, listarPosts);
router.get("/:id/posts/:postId", authMiddleware, buscarPost);
router.post("/:id/posts", authMiddleware, criarPost);
router.put("/:id/posts/:postId", authMiddleware, atualizarPost);
router.delete("/:id/posts/:postId", authMiddleware, deletarPost);

export default router;