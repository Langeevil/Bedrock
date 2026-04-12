import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import {
  createConversationMessage,
  getConversationAccess,
  getConversationChannel,
  getConversationSummary,
  listJoinedConversationIds,
  markConversationRead,
  normalizePresenceStatus,
  upsertPresence,
} from "./chatCore.js";
import { resolveAuthContext } from "./auth/authContext.js";
import { PERMISSIONS, hasPermission } from "./auth/accessControl.js";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";
const activeConnections = new Map();

export function initChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    (async () => {
      try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token ausente"));

      const payload = jwt.verify(token, JWT_SECRET);
      const auth = await resolveAuthContext(Number(payload.id || payload.sub));
      if (!auth || auth.accountStatus !== "active") {
        return next(new Error("Usuario invalido"));
      }
      socket.data.userId = auth.userId;
      socket.data.auth = auth;
      return next();
      } catch {
        return next(new Error("Token invalido"));
      }
    })();
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    const auth = socket.data.auth;
    const orgId = auth.organization?.id;
    const orgRoom = orgId ? `org:${orgId}` : null;

    const currentConnections = activeConnections.get(userId) || 0;
    activeConnections.set(userId, currentConnections + 1);

    if (orgRoom) {
      socket.join(orgRoom);
    }

    try {
      await upsertPresence(userId, "online");
      if (orgRoom) {
        io.to(orgRoom).emit("presence:changed", { user_id: userId, status: "online" });
      }

      const conversationIds = await listJoinedConversationIds(userId);
      conversationIds.forEach((conversationId) =>
        socket.join(getConversationChannel(conversationId))
      );
    } catch (err) {
      console.error("Erro ao entrar nas conversas do usuario:", err);
    }

    socket.on("chat:subscribe", async (payload) => {
      try {
        const conversationId = Number(payload?.conversationId);
        if (!Number.isInteger(conversationId) || conversationId <= 0) return;

        const access = await getConversationAccess(userId, conversationId, {
          autoJoinPublicChannel: true,
          organizationId: auth?.organization?.id || null,
          isSystemAdmin: auth?.systemRole === "system_admin",
        });

        if (!access.found || !access.allowed) return;

        socket.join(getConversationChannel(conversationId));

        const summary = await getConversationSummary(userId, conversationId, {
          organizationId: auth?.organization?.id || null,
          isSystemAdmin: auth?.systemRole === "system_admin",
        });
        if (summary) {
          socket.emit("chat:conversationUpdated", summary);
        }
      } catch (err) {
        console.error("Erro ao assinar conversa no socket:", err);
      }
    });

    socket.on("chat:unsubscribe", async (payload) => {
      const conversationId = Number(payload?.conversationId);
      if (!Number.isInteger(conversationId) || conversationId <= 0) return;
      socket.leave(getConversationChannel(conversationId));
    });

    socket.on("chat:sendMessage", async (payload) => {
      try {
        const conversationId = Number(payload?.conversationId);
        const content = String(payload?.content || "").trim();
        const messageType = String(payload?.messageType || "text").trim().toLowerCase();

        if (!Number.isInteger(conversationId) || conversationId <= 0 || !content) return;

        const access = await getConversationAccess(userId, conversationId, {
          autoJoinPublicChannel: true,
          organizationId: auth?.organization?.id || null,
          isSystemAdmin: auth?.systemRole === "system_admin",
        });

        if (!access.found || !access.allowed) return;

        if (!hasPermission(auth, PERMISSIONS.CHAT_ACCESS)) return;

        socket.join(getConversationChannel(conversationId));

        const message = await createConversationMessage({
          conversationId,
          senderId: userId,
          content,
          messageType,
        });

        io.to(getConversationChannel(conversationId)).emit("chat:messageCreated", message);

      } catch (err) {
        console.error("Erro no envio de mensagem realtime:", err);
      }
    });

    socket.on("chat:markRead", async (payload) => {
      try {
        const conversationId = Number(payload?.conversationId);
        const lastReadMessageId = Number(payload?.lastReadMessageId);

        if (!Number.isInteger(conversationId) || conversationId <= 0) return;
        if (!Number.isInteger(lastReadMessageId) || lastReadMessageId <= 0) return;

        const access = await getConversationAccess(userId, conversationId, {
          autoJoinPublicChannel: true,
          organizationId: auth?.organization?.id || null,
          isSystemAdmin: auth?.systemRole === "system_admin",
        });

        if (!access.memberRole) return;

        const receipt = await markConversationRead(userId, conversationId, lastReadMessageId);
        io.to(getConversationChannel(conversationId)).emit("chat:readUpdated", receipt);

        const summary = await getConversationSummary(userId, conversationId, {
          organizationId: auth?.organization?.id || null,
          isSystemAdmin: auth?.systemRole === "system_admin",
        });
        if (summary) {
          socket.emit("chat:conversationUpdated", summary);
        }
      } catch (err) {
        console.error("Erro ao marcar leitura via socket:", err);
      }
    });

    socket.on("presence:update", async (payload) => {
      try {
        const status = normalizePresenceStatus(payload?.status);
        const presence = await upsertPresence(userId, status);
        io.emit("presence:changed", presence);
      } catch (err) {
        console.error("Erro ao atualizar presenca via socket:", err);
      }
    });

    socket.on("disconnect", async () => {
      const nextCount = Math.max((activeConnections.get(userId) || 1) - 1, 0);

      if (nextCount === 0) {
        activeConnections.delete(userId);

        try {
          await upsertPresence(userId, "offline");
          io.emit("presence:changed", { user_id: userId, status: "offline" });
        } catch (err) {
          console.error("Erro ao atualizar presenca no disconnect:", err);
        }

        return;
      }

      activeConnections.set(userId, nextCount);
    });
  });

  return io;
}
