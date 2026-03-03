import * as model from "../models/disciplineModel.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function listDisciplines(page = 1, limit = 12) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, parseInt(limit, 10) || 12);
  const offset = (p - 1) * l;

  const [data, totalItems] = await Promise.all([
    model.findAllDisciplines(l, offset),
    model.countDisciplines(),
  ]);

  const totalPages = Math.ceil(totalItems / l);

  return {
    data,
    pagination: {
      page: p,
      limit: l,
      totalItems,
      totalPages,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
    },
  };
}

export async function getDiscipline(id) {
  const item = await model.findDisciplineById(id);
  if (!item) throw new HttpError(404, "Disciplina não encontrada.");
  return item;
}

export async function createDiscipline(payload, userId) {
  const existing = await model.findDisciplineByCode(payload.code);
  if (existing) throw new HttpError(409, "Já existe uma disciplina com esse código.");
  const created = await model.createDiscipline({ ...payload, user_id: userId });
  return created;
}

export async function updateDiscipline(id, payload) {
  const existing = await model.findDisciplineById(id);
  if (!existing) throw new HttpError(404, "Disciplina não encontrada.");

  if (payload.code && payload.code !== existing.code) {
    const byCode = await model.findDisciplineByCode(payload.code);
    if (byCode && byCode.id !== Number(id)) {
      throw new HttpError(409, "Já existe uma disciplina com esse código.");
    }
  }

  const updated = await model.updateDiscipline(id, {
    name: payload.name ?? existing.name,
    code: payload.code ?? existing.code,
    professor: payload.professor ?? existing.professor,
  });

  return updated;
}

export async function removeDiscipline(id) {
  const deleted = await model.deleteDiscipline(id);
  if (!deleted) throw new HttpError(404, "Disciplina não encontrada.");
  return deleted;
}

export default {
  listDisciplines,
  getDiscipline,
  createDiscipline,
  updateDiscipline,
  removeDiscipline,
};
