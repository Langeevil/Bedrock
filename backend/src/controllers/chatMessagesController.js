import pool from "../db.js";
import {
  createConversationMessage,
  getConversationAccess,
  getConversationSummary,
  markConversationRead,
} from "../chatCore.js";

export async function listConversationMessages(req, res) {
  const conversationId = Number(req.params.id);
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
  const beforeMessageId = req.query.beforeMessageId
    ? Number(req.query.beforeMessageId)
    : null;

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  if (beforeMessageId !== null && (!Number.isInteger(beforeMessageId) || beforeMessageId <= 0)) {
    return res.status(400).json({ error: "Cursor invalido." });
  }

  try {
    const access = await getConversationAccess(req.userId, conversationId, {
      autoJoinPublicChannel: true,
    });

    if (!access.found) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    if (!access.allowed) {
      return res.status(403).json({ error: "Sem acesso a esta conversa." });
    }

    const params = [conversationId, limit];
    let beforeClause = "";

    if (beforeMessageId) {
      params.push(beforeMessageId);
      beforeClause = `AND msg.id < $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
         msg.id,
         msg.conversation_id,
         msg.sender_id,
         msg.content,
         msg.message_type,
         msg.created_at,
         msg.edited_at,
         msg.deleted_at,
         u.id AS sender_user_id,
         u.nome AS sender_nome,
         u.email AS sender_email
       FROM chat_messages msg
       JOIN users u ON u.id = msg.sender_id
       WHERE msg.conversation_id = $1
         ${beforeClause}
       ORDER BY msg.id DESC
       LIMIT $2`,
      params
    );

    const messages = result.rows
      .reverse()
      .map((row) => ({
        id: Number(row.id),
        conversation_id: Number(row.conversation_id),
        sender_id: Number(row.sender_id),
        content: row.deleted_at ? "Mensagem removida." : row.content,
        message_type: row.message_type,
        created_at: row.created_at,
        edited_at: row.edited_at,
        deleted_at: row.deleted_at,
        sender: {
          id: Number(row.sender_user_id),
          nome: row.sender_nome,
          email: row.sender_email,
        },
        attachments: [],
      }));

    const summary = await getConversationSummary(req.userId, conversationId);

    return res.json({
      items: messages,
      has_more: messages.length === limit,
      conversation: summary,
    });
  } catch (err) {
    console.error("Erro ao listar mensagens:", err);
    return res.status(500).json({ error: "Erro ao listar mensagens." });
  }
}

export async function createMessage(req, res) {
  const conversationId = Number(req.params.id);
  const content = String(req.body?.content || "").trim();
  const messageType = String(req.body?.messageType || "text").trim().toLowerCase();

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  if (!content) {
    return res.status(400).json({ error: "Mensagem vazia." });
  }

  try {
    const access = await getConversationAccess(req.userId, conversationId, {
      autoJoinPublicChannel: true,
    });

    if (!access.found) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    if (!access.allowed) {
      return res.status(403).json({ error: "Sem acesso a esta conversa." });
    }

    const message = await createConversationMessage({
      conversationId,
      senderId: req.userId,
      content,
      messageType,
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error("Erro ao criar mensagem:", err);
    return res.status(500).json({ error: "Erro ao criar mensagem." });
  }
}

export async function markConversationAsRead(req, res) {
  const conversationId = Number(req.params.id);
  const lastReadMessageId = Number(req.body?.lastReadMessageId);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Conversa invalida." });
  }

  try {
    const access = await getConversationAccess(req.userId, conversationId, {
      autoJoinPublicChannel: true,
    });

    if (!access.found) {
      return res.status(404).json({ error: "Conversa nao encontrada." });
    }

    if (!access.memberRole) {
      return res.status(403).json({ error: "Somente membros podem marcar leitura." });
    }

    const payload = await markConversationRead(req.userId, conversationId, lastReadMessageId);
    return res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao marcar leitura.";
    const status = message === "Mensagem invalida." ? 400 : 500;
    if (status === 500) {
      console.error("Erro ao marcar leitura:", err);
    }
    return res.status(status).json({ error: message });
  }
}
