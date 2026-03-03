import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import disciplinesRoutes from "./routes/disciplines.js";
import chatRoutes from "./routes/chat.js";
import { ensureAppSchema } from "./dbInit.js";
import { initChatSocket } from "./chatSocket.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplines", disciplinesRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

async function startServer() {
  try {
    await ensureAppSchema();
    initChatSocket(server);
    server.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Falha ao inicializar servidor:", err);
    process.exit(1);
  }
}

startServer();
