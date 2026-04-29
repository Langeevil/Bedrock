import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import {
  ORGANIZATION_ROLES,
  SELF_SERVICE_ORGANIZATION_ROLES,
  SYSTEM_ROLES,
  buildAuthSummary,
  normalizeOrganizationRole,
} from "../auth/accessControl.js";
import { resolveAuthContext, toPublicUser } from "../auth/authContext.js";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

function getPasswordValidationError(password) {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter ao menos uma letra minúscula.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter ao menos uma letra maiúscula.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve conter ao menos um número.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "A senha deve conter ao menos um caractere especial.";
  }

  return null;
}

function buildTokenPayload(auth) {
  return {
    sub: auth.userId,
    id: auth.userId,
    system_role: auth.systemRole,
    organization_id: auth.organization?.id || null,
    organization_role: auth.membership?.role || null,
  };
}

async function ensureDefaultOrganization(client, creatorUserId = null) {
  const existing = await client.query(
    "SELECT id FROM organizations ORDER BY id ASC LIMIT 1"
  );

  if (existing.rows.length > 0) {
    return Number(existing.rows[0].id);
  }

  const created = await client.query(
    `INSERT INTO organizations (name, slug, created_by)
     VALUES ($1, $2, $3)
     RETURNING id`,
    ["Bedrock Local", "bedrock-local", creatorUserId]
  );

  return Number(created.rows[0].id);
}

export async function cadastrar(req, res) {
  const nome = String(req.body?.nome || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const senha = String(req.body?.senha || "");
  const requestedRole = normalizeOrganizationRole(req.body?.role);

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const passwordValidationError = getPasswordValidationError(senha);

  if (passwordValidationError) {
    return res.status(400).json({ error: passwordValidationError });
  }

  if (requestedRole && !SELF_SERVICE_ORGANIZATION_ROLES.has(requestedRole)) {
    return res.status(400).json({ error: "Papel inicial invalido." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const usuarioExistente = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email ja cadastrado." });
    }

    const totalUsers = await client.query("SELECT COUNT(*)::int AS count FROM users");
    const isFirstUser = Number(totalUsers.rows[0]?.count || 0) === 0;
    const senhaHash = await bcrypt.hash(senha, 10);

    const inserted = await client.query(
      `INSERT INTO users (nome, email, senha_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        nome,
        email,
        senhaHash,
        isFirstUser
          ? ORGANIZATION_ROLES.ORGANIZATION_OWNER
          : requestedRole || ORGANIZATION_ROLES.STUDENT,
      ]
    );

    const userId = Number(inserted.rows[0].id);
    const organizationId = await ensureDefaultOrganization(client, userId);
    const membershipRole = isFirstUser
      ? ORGANIZATION_ROLES.ORGANIZATION_OWNER
      : requestedRole || ORGANIZATION_ROLES.STUDENT;

    await client.query(
      `UPDATE users
       SET primary_organization_id = $2,
           system_role = CASE
             WHEN $3 = TRUE THEN $4
             ELSE system_role
           END
       WHERE id = $1`,
      [userId, organizationId, isFirstUser, SYSTEM_ROLES.SYSTEM_ADMIN]
    );

    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status`,
      [organizationId, userId, membershipRole]
    );

    await client.query("COMMIT");

    const auth = await resolveAuthContext(userId);

    return res.status(201).json({
      message: "Usuario cadastrado com sucesso.",
      usuario: toPublicUser(auth),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    client.release();
  }
}

export async function entrar(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const senha = String(req.body?.senha || "");

    if (!email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const resultado = await pool.query(
      "SELECT id, senha_hash FROM users WHERE LOWER(email) = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const auth = await resolveAuthContext(usuario.id);

    if (!auth) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    if (auth.accountStatus !== "active") {
      return res.status(403).json({ error: "Conta inativa." });
    }

    const token = jwt.sign(buildTokenPayload(auth), JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      usuario: toPublicUser(auth),
      authz: buildAuthSummary(auth),
    });
  } catch (err) {
    console.error("Erro ao entrar:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

export async function buscarUsuarioLogado(req, res) {
  try {
    const auth = req.auth || (await resolveAuthContext(req.userId));

    if (!auth) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    return res.json(toPublicUser(auth));
  } catch (err) {
    console.error("Erro ao buscar usuario:", err);
    return res.status(500).json({ error: "Erro ao buscar usuario." });
  }
}

export async function atualizarPerfil(req, res) {
  try {
    const role = normalizeOrganizationRole(req.body?.role);

    if (!role || !SELF_SERVICE_ORGANIZATION_ROLES.has(role)) {
      return res.status(400).json({ error: "Tipo invalido." });
    }

    if (!req.auth?.organization?.id) {
      return res.status(400).json({ error: "Usuario sem organizacao ativa." });
    }

    await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2`,
      [role, req.userId]
    );

    await pool.query(
      `UPDATE organization_memberships
       SET role = $3
       WHERE organization_id = $1
         AND user_id = $2`,
      [req.auth.organization.id, req.userId, role]
    );

    const auth = await resolveAuthContext(req.userId);

    return res.json({
      message: "Perfil atualizado com sucesso.",
      usuario: toPublicUser(auth),
    });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
}

export async function deletarUsuario(req, res) {
  try {
    const resultado = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [req.userId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    return res.json({ message: "Usuario deletado com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar usuario:", err);
    return res.status(500).json({ error: "Erro ao deletar usuario." });
  }
}
