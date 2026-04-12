import * as model from "../models/disciplineModel.js";
import pool from "../db.js";
import {
  canAccessDiscipline,
  canCreateDiscipline,
  canListAllDisciplines,
  canMutateDiscipline,
} from "./resourceAccessService.js";
import { normalizeOrganizationRole } from "../auth/accessControl.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function normalizeDisciplineRole(role) {
  const normalized = normalizeOrganizationRole(role);
  if (!normalized) return null;
  return normalized;
}

async function ensureOrganizationUser(userId, organizationId) {
  const result = await pool.query(
    `SELECT 1
     FROM organization_memberships
     WHERE user_id = $1
       AND organization_id = $2
       AND status = 'active'`,
    [userId, organizationId]
  );
  return result.rows.length > 0;
}

export async function listDisciplines(page = 1, limit = 12, auth) {
  const p = Math.max(1, Number.parseInt(page, 10) || 1);
  const l = Math.min(50, Number.parseInt(limit, 10) || 12);
  const offset = (p - 1) * l;

  if (!auth?.organization?.id) {
    throw new HttpError(400, "Usuario sem organizacao ativa.");
  }

  const listAll = canListAllDisciplines(auth);

  const [data, totalItems] = await Promise.all([
    listAll
      ? model.findAllDisciplinesByOrganization(auth.organization.id, l, offset, auth.userId)
      : model.findDisciplinesByMember(auth.userId, auth.organization.id, l, offset),
    listAll
      ? model.countDisciplinesByOrganization(auth.organization.id)
      : model.countDisciplinesByMember(auth.userId, auth.organization.id),
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

export async function getDiscipline(id, auth) {
  const item = await model.findDisciplineById(id, auth?.organization?.id || null, auth?.userId || null);
  if (!item) throw new HttpError(404, "Disciplina nao encontrada.");
  if (!canAccessDiscipline(auth, item)) {
    throw new HttpError(403, "Sem permissao para acessar esta disciplina.");
  }
  return item;
}

export async function createDiscipline(payload, auth) {
  if (!canCreateDiscipline(auth)) {
    throw new HttpError(403, "Sem permissao para criar disciplinas.");
  }

  const existing = await model.findDisciplineByCode(payload.code, auth.organization.id);
  if (existing) throw new HttpError(409, "Ja existe uma disciplina com esse codigo.");

  const created = await model.createDiscipline({
    ...payload,
    user_id: auth.userId,
    organization_id: auth.organization.id,
  });

  const creatorRole =
    auth.effectiveRole && auth.effectiveRole !== "student" && auth.effectiveRole !== "external_partner"
      ? auth.effectiveRole
      : "professor";

  await model.addDisciplineMember(created.id, auth.userId, creatorRole);

  return model.findDisciplineById(created.id, auth.organization.id, auth.userId);
}

export async function updateDiscipline(id, payload, auth) {
  const existing = await model.findDisciplineById(id, auth?.organization?.id || null, auth?.userId || null);
  if (!existing) throw new HttpError(404, "Disciplina nao encontrada.");
  if (!canMutateDiscipline(auth, existing)) {
    throw new HttpError(403, "Sem permissao para alterar esta disciplina.");
  }

  if (payload.code && payload.code !== existing.code) {
    const byCode = await model.findDisciplineByCode(payload.code, auth.organization.id);
    if (byCode && byCode.id !== Number(id)) {
      throw new HttpError(409, "Ja existe uma disciplina com esse codigo.");
    }
  }

  return model.updateDiscipline(id, auth.organization.id, {
    name: payload.name ?? existing.name,
    code: payload.code ?? existing.code,
    professor: payload.professor ?? existing.professor,
  });
}

export async function removeDiscipline(id, auth) {
  const existing = await model.findDisciplineById(id, auth?.organization?.id || null, auth?.userId || null);
  if (!existing) throw new HttpError(404, "Disciplina nao encontrada.");
  if (!canMutateDiscipline(auth, existing)) {
    throw new HttpError(403, "Sem permissao para remover esta disciplina.");
  }

  const deleted = await model.deleteDiscipline(id, auth.organization.id);
  if (!deleted) throw new HttpError(404, "Disciplina nao encontrada.");
  return deleted;
}

export async function listDisciplineMembers(id, auth) {
  const discipline = await getDiscipline(id, auth);
  return model.listDisciplineMembers(discipline.id);
}

export async function addDisciplineMember(id, payload, auth) {
  const discipline = await getDiscipline(id, auth);
  if (!canMutateDiscipline(auth, discipline)) {
    throw new HttpError(403, "Sem permissao para gerenciar membros desta disciplina.");
  }

  const userId = Number(payload?.userId);
  const role = normalizeDisciplineRole(payload?.role) || "student";

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(400, "Usuario invalido.");
  }

  const inSameOrganization = await ensureOrganizationUser(userId, auth.organization.id);
  if (!inSameOrganization) {
    throw new HttpError(400, "Usuario nao pertence a organizacao ativa.");
  }

  await model.addDisciplineMember(discipline.id, userId, role);
  return model.listDisciplineMembers(discipline.id);
}
