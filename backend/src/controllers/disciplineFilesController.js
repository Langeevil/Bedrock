import * as repository from "../repositories/disciplineFilesRepository.js";
import * as disciplineRepository from "../repositories/disciplineRepository.js";

import path from "node:path";
import fs from "node:fs";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Faz download de um arquivo do banco de dados (BYTEA)
 */
export async function baixarArquivo(req, res) {
  try {
    const { id, fileId } = req.params;
    console.log(`[DOWNLOAD] Iniciando download do banco: disciplina ${id}, arquivo ${fileId}`);

    const arquivo = await repository.findFileById(fileId);
    if (!arquivo) {
      console.error(`[DOWNLOAD] Arquivo ID ${fileId} não encontrado no banco.`);
      throw new HttpError(404, "Arquivo não encontrado no banco.");
    }

    if (arquivo.discipline_id !== Number.parseInt(id, 10)) {
      console.error(`[DOWNLOAD] Disciplina ID ${id} não coincide com o arquivo (pertence a ${arquivo.discipline_id}).`);
      throw new HttpError(404, "Arquivo não pertence a esta disciplina.");
    }

    if (!arquivo.file_data) {
      console.error(`[DOWNLOAD] Conteúdo binário (file_data) não encontrado para o arquivo ID ${fileId}.`);
      throw new HttpError(404, "Conteúdo do arquivo não encontrado no banco.");
    }

    console.log(`[DOWNLOAD] Enviando arquivo do banco: ${arquivo.original_name}`);
    
    // Configura headers
    res.setHeader("Content-Type", arquivo.mime_type);
    
    if (req.query.view === "true") {
      res.setHeader("Content-Disposition", `inline; filename="${arquivo.original_name}"`);
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="${arquivo.original_name}"`);
    }

    // Envia o buffer diretamente do banco
    return res.send(arquivo.file_data);
  } catch (err) {
    console.error("Erro ao baixar arquivo do banco:", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
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

    const page = req.query.page
      ? Number.parseInt(req.query.page, 10)
      : 1;

    const limit = req.query.limit
      ? Number.parseInt(req.query.limit, 10)
      : 20;

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
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
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

    if (arquivo?.discipline_id !== Number.parseInt(id, 10)) {
      throw new HttpError(404, "Arquivo não encontrado.");
    }

    res.json(arquivo);
  } catch (err) {
    console.error("Erro ao buscar arquivo:", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Cria um novo arquivo (metadados)
 */
export async function criarArquivo(req, res) {
  try {
    const { id } = req.params;
    const {
      file_name,
      original_name,
      storage_key,
      mime_type,
      size_bytes,
    } = req.body;

    if (
      !file_name ||
      !original_name ||
      !storage_key ||
      !mime_type ||
      !size_bytes
    ) {
      throw new HttpError(
        400,
        "Campos obrigatórios: file_name, original_name, storage_key, mime_type, size_bytes"
      );
    }

    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    const existente = await repository.findFileByName(id, file_name);
    if (existente)
      throw new HttpError(
        409,
        "Arquivo com este nome já existe nesta disciplina."
      );

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
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
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

    if (arquivo?.discipline_id !== Number.parseInt(id, 10)) {
      throw new HttpError(404, "Arquivo não encontrado.");
    }

    const deletado = await repository.deleteFile(fileId);
    if (!deletado) throw new HttpError(404, "Arquivo não encontrado.");

    res.json({
      message: "Arquivo deletado com sucesso.",
      id: deletado.id,
    });
  } catch (err) {
    console.error("Erro ao deletar arquivo:", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
  }
}

/**
 * Upload de arquivo diretamente para o banco (BYTEA)
 */
export async function uploadArquivo(req, res) {
  try {
    const { id } = req.params;

    const disciplina = await disciplineRepository.findDisciplineById(id);
    if (!disciplina) throw new HttpError(404, "Disciplina não encontrada.");

    if (!req.file)
      throw new HttpError(400, "Arquivo não enviado.");

    console.log(`[UPLOAD] Recebido arquivo para o banco: ${req.file.originalname} (${req.file.size} bytes)`);

    const arquivo = await repository.createFile({
      discipline_id: id,
      file_name: req.file.originalname, // Usamos o nome original como chave lógica
      original_name: req.file.originalname,
      storage_key: "database", // Marcador de que está no banco
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      uploaded_by: req.userId || null,
      file_data: req.file.buffer, // O buffer vindo do MemoryStorage do Multer
    });

    res.status(201).json(arquivo);
  } catch (err) {
    console.error("Erro ao fazer upload para o banco:", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erro interno no servidor." });
  }
}

export default {
  listarArquivos,
  buscarArquivo,
  criarArquivo,
  deletarArquivo,
  uploadArquivo,
};