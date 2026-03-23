import { getRelevantPresenceForUser } from "../chatCore.js";

export async function listRelevantPresence(req, res) {
  try {
    const presence = await getRelevantPresenceForUser(req.userId, {
      organizationId: req.auth?.organization?.id || null,
      isSystemAdmin: req.auth?.systemRole === "system_admin",
    });
    return res.json(presence);
  } catch (err) {
    console.error("Erro ao listar presenca:", err);
    return res.status(500).json({ error: "Erro ao listar presenca." });
  }
}
