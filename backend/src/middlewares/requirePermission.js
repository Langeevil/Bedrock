import { hasPermission } from "../auth/accessControl.js";

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Autenticacao obrigatoria." });
    }

    if (!hasPermission(req.auth, permission)) {
      return res.status(403).json({ error: "Sem permissao para executar esta acao." });
    }

    return next();
  };
}

export default requirePermission;
