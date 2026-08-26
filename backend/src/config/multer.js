import multer from "multer";
import path from "path";
import crypto from "crypto";

// Configuracion de Multer para subir documentos
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const postulanteId = req.params.id;
    const dir = path.resolve("uploads", "postulantes", String(postulanteId));
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const random = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${random}${ext}`);
  },
});

const fileFilter = (_req, _file, cb) => {
  cb(null, true);
};

// Limite de tamano del archivo
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

export const uploadDocumento = multer({ storage, fileFilter, limits });
