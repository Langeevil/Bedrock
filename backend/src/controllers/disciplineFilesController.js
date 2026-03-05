// controllers/disciplineFilesController.js
import * as repository from "../repositories/disciplineFilesRepository.js";
import * as disciplineRepository from "../repositories/disciplineRepository.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Lista todos os arquivos de uma disciplina
 */
export async function listarArquivos(req, res) {
  try {
    const { id } = req.params;
    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const [arquivos, total] = await Promise.all([
      repository.findFilesByDisciplineIdPaginated(id, limit, offset),
      repository.countFilesByDisciplineId(id),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: arquivos,
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
    console.error("Erro ao listar arquivos:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Busca um arquivo específico
 */
export async function buscarArquivo(req, res) {
  try {
    const { id, fileId } = req.params;
    
    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    const arquivo = await repository.findFileById(fileId);
    if (!arquivo || arquivo.discipline_id !== parseInt(id, 10)) {
      throw new HttpError(404, "Arquivo não encontrado.");
    }

    res.json(arquivo);
  } catch (err) {
    console.error("Erro ao buscar arquivo:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Cria um novo arquivo
 * TODO: Implementar upload real com multer
 */
export async function criarArquivo(req, res) {
  try {
    const { id } = req.params;
    const { file_name, original_name, storage_key, mime_type, size_bytes } = req.body;

    // Validação
    if (!file_name || !original_name || !storage_key || !mime_type || !size_bytes) {
      throw new HttpError(400, "Campos obrigatórios: file_name, original_name, storage_key, mime_type, size_bytes");
    }

    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    // Verifica se arquivo com este nome já existe
    const existente = await repository.findFileByName(id, file_name);
    if (existente) throw new HttpError(409, "Arquivo com este nome já existe nesta disciplina.");

    const arquivo = await repository.createFile({
      discipline_id: id,
      file_name,
      original_name,
      storage_key,
      mime_type,
      size_bytes,
      uploaded_by: req.userId,
    });

    res.status(201).json(arquivo);
  } catch (err) {
    console.error("Erro ao criar arquivo:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Deleta um arquivo
 */
export async function deletarArquivo(req, res) {
  try {
    const { id, fileId } = req.params;

    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    const arquivo = await repository.findFileById(fileId);
    if (!arquivo || arquivo.discipline_id !== parseInt(id, 10)) {
      throw new HttpError(404, "Arquivo não encontrado.");
    }

    // TODO: Deletar arquivo do storage (local ou cloud)

    const deletado = await repository.deleteFile(fileId);
    if (!deletado) throw new HttpError(404, "Arquivo não encontrado.");

    res.json({ message: "Arquivo deletado com sucesso.", id: deletado.id });
  } catch (err) {
    console.error("Erro ao deletar arquivo:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Faz upload de um arquivo (apenas estrutura, implementação real com multer)
 * TODO: Implementar upload real com multer
 */
export async function uploadArquivo(req, res) {
  try {
    const { id } = req.params;

    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    // TODO: Implementar lógica real de upload
    // - Validar arquivo (tamanho, tipo)
    // - Salvar no storage (local ou cloud)
    // - Criar registro no banco

    throw new HttpError(501, "Funcionalidade de upload ainda não implementada.");
  } catch (err) {
    console.error("Erro ao fazer upload:", err);
    res.status(err.status || 500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export default {
  listarArquivos,
  buscarArquivo,
  criarArquivo,
  deletarArquivo,
  uploadArquivo,
};
