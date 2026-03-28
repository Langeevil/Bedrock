import pool from "../db.js";

function baseSelect(userIdProvided) {
  return `
    SELECT
      d.*,
      dm.role AS current_membership_role,
      dm.status AS current_membership_status
    FROM disciplines d
    LEFT JOIN discipline_memberships dm
      ON dm.discipline_id = d.id
     AND dm.user_id = ${userIdProvided ? "$2" : "NULL"}
  `;
}

export async function countDisciplinesByOrganization(organizationId) {
  const res = await pool.query(
    "SELECT COUNT(*) FROM disciplines WHERE organization_id = $1",
    [organizationId]
  );
  return Number.parseInt(res.rows[0].count, 10);
}

export async function countDisciplinesByMember(userId, organizationId) {
  const res = await pool.query(
    `SELECT COUNT(*) 
     FROM discipline_memberships dm
     JOIN disciplines d ON d.id = dm.discipline_id
     WHERE dm.user_id = $1
       AND dm.status = 'active'
       AND d.organization_id = $2`,
    [userId, organizationId]
  );
  return Number.parseInt(res.rows[0].count, 10);
}

export async function findAllDisciplinesByOrganization(organizationId, limit, offset, userId = null) {
  const params = userId === null
    ? [organizationId, limit, offset]
    : [organizationId, userId, limit, offset];
  const limitIndex = userId === null ? 2 : 3;
  const offsetIndex = userId === null ? 3 : 4;

  const res = await pool.query(
    `${baseSelect(userId !== null)}
     WHERE d.organization_id = $1
     ORDER BY d.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
  return res.rows;
}

export async function findDisciplinesByMember(userId, organizationId, limit, offset) {
  const res = await pool.query(
    `SELECT
       d.*,
       dm.role AS current_membership_role,
       dm.status AS current_membership_status
     FROM discipline_memberships dm
     JOIN disciplines d ON d.id = dm.discipline_id
     WHERE dm.user_id = $1
       AND dm.status = 'active'
       AND d.organization_id = $2
     ORDER BY d.created_at DESC
     LIMIT $3 OFFSET $4`,
    [userId, organizationId, limit, offset]
  );
  return res.rows;
}

export async function findDisciplineById(id, organizationId = null, userId = null) {
  const params =
    userId === null
      ? [id, organizationId]
      : [id, userId, organizationId];
  const orgIndex = userId === null ? 2 : 3;

  const res = await pool.query(
    `${baseSelect(userId !== null)}
     WHERE d.id = $1
       AND ($${orgIndex}::int IS NULL OR d.organization_id = $${orgIndex})`,
    params
  );
  return res.rows[0] || null;
}

export async function findDisciplineByCode(code, organizationId) {
  const res = await pool.query(
    `SELECT *
     FROM disciplines
     WHERE code = $1
       AND organization_id = $2`,
    [code, organizationId]
  );
  return res.rows[0] || null;
}

export async function createDiscipline({
  name,
  code,
  professor,
  user_id,
  organization_id,
}) {
  const res = await pool.query(
    `INSERT INTO disciplines (name, code, professor, user_id, organization_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, code, professor, user_id, organization_id]
  );
  return res.rows[0];
}

export async function updateDiscipline(id, { name, code, professor }) {
  const res = await pool.query(
    `UPDATE disciplines
     SET name = $1, code = $2, professor = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, code, professor, id]
  );
  return res.rows[0] || null;
}

export async function deleteDiscipline(id) {
  const res = await pool.query(
    "DELETE FROM disciplines WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] || null;
}

export async function listDisciplineMembers(disciplineId) {
  const res = await pool.query(
    `SELECT
       dm.user_id AS id,
       u.nome,
       u.email,
       u.role AS organization_role,
       u.system_role,
       dm.role AS discipline_role,
       dm.status,
       dm.joined_at
     FROM discipline_memberships dm
     JOIN users u ON u.id = dm.user_id
     WHERE dm.discipline_id = $1
       AND dm.status = 'active'
     ORDER BY
       CASE dm.role
         WHEN 'professor' THEN 0
         WHEN 'coordinator' THEN 1
         ELSE 2
       END,
       LOWER(u.nome),
       LOWER(u.email)`,
    [disciplineId]
  );
  return res.rows.map((row) => ({
    id: Number(row.id),
    nome: row.nome,
    email: row.email,
    organization_role: row.organization_role,
    discipline_role: row.discipline_role,
    system_role: row.system_role,
    status: row.status,
    joined_at: row.joined_at,
  }));
}

export async function addDisciplineMember(disciplineId, userId, role) {
  const res = await pool.query(
    `INSERT INTO discipline_memberships (discipline_id, user_id, role, status)
     VALUES ($1, $2, $3, 'active')
     ON CONFLICT (discipline_id, user_id)
     DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status
     RETURNING discipline_id, user_id, role, status, joined_at`,
    [disciplineId, userId, role]
  );
  return res.rows[0] || null;
}
