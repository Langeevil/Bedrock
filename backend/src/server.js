import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import disciplinesRoutes from "./routes/disciplines.js";
import { ensureAppSchema } from "./dbInit.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplines", disciplinesRoutes);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await ensureAppSchema();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Falha ao inicializar servidor:", err);
    process.exit(1);
  }
}

startServer();
