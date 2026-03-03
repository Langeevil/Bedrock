import pool from "../db.js";

async function ensureGeneralMembershipForUser(userId) {
  const roomRes = await pool.query(
    "SELECT id FROM chat_rooms WHERE name = 'Geral' ORDER BY id ASC LIMIT 1"
  );

  const generalId = roomRes.rows[0]?.id;
  if (!generalId) return;

  await pool.query(
    `INSERT INTO chat_room_members (room_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (room_id, user_id) DO NOTHING`,
    [generalId, userId]
  );
}

export async function listRooms(req, res) {
  try {
    await ensureGeneralMembershipForUser(req.userId);

    const result = await pool.query(
      `SELECT
         r.id,
         r.name,
         r.is_direct,
         r.created_at,
         lm.content AS last_message,
         lm.created_at AS last_message_at
       FROM chat_room_members m
       JOIN chat_rooms r ON r.id = m.room_id
       LEFT JOIN LATERAL (
         SELECT content, created_at
         FROM chat_messages
         WHERE room_id = r.id
         ORDER BY created_at DESC
         LIMIT 1
       ) lm ON TRUE
       WHERE m.user_id = $1
       ORDER BY COALESCE(lm.created_at, r.created_at) DESC`,
      [req.userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar salas de chat:", err);
    return res.status(500).json({ error: "Erro ao listar salas de chat." });
  }
}

export async function createRoom(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "Informe o nome da sala." });
    }

    const created = await pool.query(
      `INSERT INTO chat_rooms (name, is_direct, created_by)
       VALUES ($1, FALSE, $2)
       RETURNING id, name, is_direct, created_at`,
      [name, req.userId]
    );

    const room = created.rows[0];

    await pool.query(
      `INSERT INTO chat_room_members (room_id, user_id)
       SELECT $1, u.id FROM users u
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [room.id]
    );

    return res.status(201).json(room);
  } catch (err) {
    console.error("Erro ao criar sala:", err);
    return res.status(500).json({ error: "Erro ao criar sala." });
  }
}

export async function listMessages(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({ error: "Sala invalida." });
    }

    const member = await pool.query(
      "SELECT 1 FROM chat_room_members WHERE room_id = $1 AND user_id = $2",
      [roomId, req.userId]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ error: "Sem acesso a esta sala." });
    }

    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);

    const result = await pool.query(
      `SELECT
         msg.id,
         msg.room_id,
         msg.user_id,
         msg.content,
         msg.created_at,
         u.nome AS user_nome,
         u.email AS user_email
       FROM chat_messages msg
       JOIN users u ON u.id = msg.user_id
       WHERE msg.room_id = $1
       ORDER BY msg.created_at DESC
       LIMIT $2`,
      [roomId, limit]
    );

    return res.json(result.rows.reverse());
  } catch (err) {
    console.error("Erro ao listar mensagens:", err);
    return res.status(500).json({ error: "Erro ao listar mensagens." });
  }
}

export async function createMessage(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    const content = String(req.body?.content || "").trim();

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({ error: "Sala invalida." });
    }
    if (!content) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const member = await pool.query(
      "SELECT 1 FROM chat_room_members WHERE room_id = $1 AND user_id = $2",
      [roomId, req.userId]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ error: "Sem acesso a esta sala." });
    }

    const created = await pool.query(
      `INSERT INTO chat_messages (room_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, room_id, user_id, content, created_at`,
      [roomId, req.userId, content]
    );

    const user = await pool.query(
      "SELECT nome, email FROM users WHERE id = $1",
      [req.userId]
    );

    return res.status(201).json({
      ...created.rows[0],
      user_nome: user.rows[0]?.nome || "",
      user_email: user.rows[0]?.email || "",
    });
  } catch (err) {
    console.error("Erro ao criar mensagem:", err);
    return res.status(500).json({ error: "Erro ao criar mensagem." });
  }
}
