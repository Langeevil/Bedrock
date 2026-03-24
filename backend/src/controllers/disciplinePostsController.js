// controllers/disciplinePostsController.js
import * as repository from "../repositories/disciplinePostsRepository.js";
import { getDiscipline as getAuthorizedDiscipline } from "../services/disciplineService.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Lista todos os posts de uma disciplina
 */
export async function listarPosts(req, res) {
  try {
    const { id } = req.params;
    await getAuthorizedDiscipline(id, req.auth);

    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      repository.findPostsByDisciplineIdPaginated(id, limit, offset),
      repository.countPostsByDisciplineId(id),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: posts,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Erro ao listar posts:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Busca um post específico
 */
export async function buscarPost(req, res) {
  try {
    const { id, postId } = req.params;

    await getAuthorizedDiscipline(id, req.auth);

    const post = await repository.findPostById(postId);
    if (!post || post.discipline_id !== parseInt(id, 10)) {
      throw new HttpError(404, "Post não encontrado.");
    }

    res.json(post);
  } catch (err) {
    console.error("Erro ao buscar post:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Cria um novo post
 */
export async function criarPost(req, res) {
  try {
    const { id } = req.params;
    const { content, pinned, fileId } = req.body;

    // Validação: precisa de conteúdo OU um arquivo
    if ((!content || content.trim().length === 0) && !fileId) {
      throw new HttpError(400, "Campo obrigatório: content ou fileId");
    }

    await getAuthorizedDiscipline(id, req.auth);

    const post = await repository.createPost({
      discipline_id: id,
      author_id: req.userId,
      content: (content || "").trim(),
      pinned: Boolean(pinned),
      file_id: fileId || null,
    });

    // Buscar dados completos do post (incluindo join com arquivos)
    const postCompleto = await repository.findPostById(post.id);
    res.status(201).json(postCompleto);
  } catch (err) {
    console.error("Erro ao criar post:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Atualiza um post (apenas o autor pode)
 */
export async function atualizarPost(req, res) {
  try {
    const { id, postId } = req.params;
    const { content, pinned } = req.body;

    await getAuthorizedDiscipline(id, req.auth);

    const post = await repository.findPostById(postId);
    if (!post || post.discipline_id !== parseInt(id, 10)) {
      throw new HttpError(404, "Post não encontrado.");
    }

    // Validar permissão (apenas o autor ou admin)
    if (post.author_id !== req.userId) {
      throw new HttpError(403, "Você não tem permissão para atualizar este post.");
    }

    if (content && content.trim().length === 0) {
      throw new HttpError(400, "Conteúdo não pode estar vazio.");
    }

    const atualizado = await repository.updatePost(postId, {
      content: content ? content.trim() : undefined,
      pinned,
    });

    if (!atualizado) throw new HttpError(404, "Post não encontrado.");

    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar post:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Deleta um post (soft delete)
 */
export async function deletarPost(req, res) {
  try {
    const { id, postId } = req.params;

    await getAuthorizedDiscipline(id, req.auth);

    const post = await repository.findPostById(postId);
    if (!post || post.discipline_id !== parseInt(id, 10)) {
      throw new HttpError(404, "Post não encontrado.");
    }

    // Validar permissão (apenas o autor ou admin)
    if (post.author_id !== req.userId) {
      throw new HttpError(403, "Você não tem permissão para deletar este post.");
    }

    const deletado = await repository.deletePost(postId);
    if (!deletado) throw new HttpError(404, "Post não encontrado.");

    res.json({ message: "Post deletado com sucesso.", id: deletado.id });
  } catch (err) {
    console.error("Erro ao deletar post:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export default {
  listarPosts,
  buscarPost,
  criarPost,
  atualizarPost,
  deletarPost,
};
