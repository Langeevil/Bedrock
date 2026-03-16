import multer from "multer";

// Armazenamento em memória para salvar o arquivo diretamente no banco de dados (BYTEA)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Limite de 20MB
  },
});
