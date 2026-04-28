import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "node:http";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import disciplinesRoutes from "./routes/disciplines.js";
import chatRoutes from "./routes/chat.js";
import projectRoutes from "./routes/projects.js";
import organizationRoutes from "./routes/organizations.js";
import adminRoutes from "./routes/admin.js";
import statisticsRoutes from "./routes/statistics.js";
import taskRoutes from "./routes/tasks.js";

import livroRoutes from "./Biblioteca/Livro/routes/livroRoute.js";
import emprestimoRoutes from "./Biblioteca/Emprestimo/routes/emprestimoRoute.js";
import estatisticaRoutes from "./Estatisticas/routes/estatisticaRoute.js";

import { ensureAppSchema } from "./dbInit.js";
import { initChatSocket } from "./chatSocket.js";
import pool from "./db.js";
import { runMigrations } from "./migrationRunner.js";

dotenv.config();

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || process.env.CLIENT_ORIGIN || "";
  const configured = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ];
}

const allowedOrigins = parseAllowedOrigins();
const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem nao permitida por CORS."));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "bedrock-backend",
    allowed_origins: allowedOrigins,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplines", disciplinesRoutes);
app.use("/api/disciplines", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/livros", livroRoutes);
app.use("/api/emprestimos", emprestimoRoutes);
app.use("/api/estatisticas", estatisticaRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

await ensureAppSchema();
await runMigrations(pool);

initChatSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
