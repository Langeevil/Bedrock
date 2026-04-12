import jwt from "jsonwebtoken";
import { resolveAuthContext } from "../auth/authContext.js";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

export async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token nao fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = Number(decoded.id || decoded.sub);
    const auth = await resolveAuthContext(userId);

    if (!auth) {
      return res.status(401).json({ error: "Usuario nao encontrado." });
    }

    if (auth.accountStatus !== "active") {
      return res.status(403).json({ error: "Conta inativa." });
    }

    req.userId = auth.userId;
    req.orgId = auth.organization?.id || null;
    req.systemRole = auth.systemRole || null;
    req.auth = auth;
    return next();
  } catch {
    return res.status(401).json({ error: "Token invalido ou expirado." });
  }
}

export default autenticar;
