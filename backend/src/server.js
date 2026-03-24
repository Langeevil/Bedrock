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
<<<<<<< HEAD
import adminRoutes from "./routes/admin.js";
=======
import livroRoutes from "./Biblioteca/Livro/routes/livroRoute.js";
import emprestimoRoutes from "./Biblioteca/Emprestimo/routes/emprestimoRoute.js";
>>>>>>> f0909a0c039269dd5b1be5d346765b0a8ef5e8eb

import { ensureAppSchema } from "./dbInit.js";
import { initChatSocket } from "./chatSocket.js";
import pool from "./db.js";
import { runMigrations } from "./migrationRunner.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ROTAS */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplines", disciplinesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/organizations", organizationRoutes);
<<<<<<< HEAD
app.use("/api/admin", adminRoutes);
=======
app.use("/api/livros", livroRoutes);
app.use("/api/emprestimos", emprestimoRoutes);
>>>>>>> f0909a0c039269dd5b1be5d346765b0a8ef5e8eb
app.use("/uploads", express.static("uploads"));
/* SERVER HTTP */
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

/* 🔥 TOP-LEVEL AWAIT (sem função startServer) */
await ensureAppSchema();
await runMigrations(pool);

initChatSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
