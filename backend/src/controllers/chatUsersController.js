import pool from "../db.js";
import { PERMISSIONS, hasPermission } from "../auth/accessControl.js";

const searchRateLimit = new Map();
const SEARCH_WINDOW_MS = 60 * 1000;
const SEARCH_LIMIT = 20;

function canSearch(userId) {
  const now = Date.now();
  const recent = (searchRateLimit.get(userId) || []).filter(
    (timestamp) => now - timestamp < SEARCH_WINDOW_MS
  );

  if (recent.length >= SEARCH_LIMIT) {
    searchRateLimit.set(userId, recent);
    return false;
  }

  recent.push(now);
  searchRateLimit.set(userId, recent);
  return true;
}

export async function searchUsers(req, res) {
  try {
    if (!hasPermission(req.auth, PERMISSIONS.USER_VIEW_DIRECTORY)) {
      return res.status(403).json({ error: "Sem permissao para buscar usuarios." });
    }

    if (!req.auth?.organization?.id) {
      return res.status(400).json({ error: "Usuario sem organizacao ativa." });
    }

    if (!canSearch(req.userId)) {
      return res.status(429).json({ error: "Muitas buscas. Tente novamente em instantes." });
    }

    const query = String(req.query.q || "").trim().toLowerCase();
    if (query.length < 2) {
      return res.json([]);
    }

    const isEmailSearch = query.includes("@");
    const pattern = `%${query}%`;
    const domainPattern = isEmailSearch ? null : `%@${query}%`;

    const result = await pool.query(
      `SELECT
         u.id,
         u.nome,
         u.email,
         u.role,
         COALESCE(p.status, 'offline') AS presence_status
       FROM users u
       JOIN organization_memberships om
         ON om.user_id = u.id
       LEFT JOIN chat_user_presence p ON p.user_id = u.id
       WHERE u.id <> $1
         AND om.organization_id = $2
         AND om.status = 'active'
         AND (
           LOWER(u.email) LIKE $3
           OR LOWER(u.nome) LIKE $3
           OR ($6::text IS NOT NULL AND LOWER(u.email) LIKE $6)
         )
       ORDER BY
         CASE
           WHEN LOWER(u.email) = $4 THEN 0
           WHEN LOWER(u.email) LIKE $5 THEN 1
           ELSE 2
         END,
         LOWER(u.nome),
         LOWER(u.email)
       LIMIT 20`,
      [req.userId, req.auth.organization.id, pattern, query, `${query}%`, domainPattern]
    );

    return res.json(
      result.rows.map((row) => ({
        id: Number(row.id),
        nome: row.nome,
        email: row.email,
        role: row.role,
        presence_status: row.presence_status,
      }))
    );
  } catch (err) {
    console.error("Erro ao buscar usuarios no chat:", err);
    return res.status(500).json({ error: "Erro ao buscar usuarios." });
  }
}
