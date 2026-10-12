import multer from 'multer'
import { DOCX_MIME } from '../services/documentos-laborales.service.js'

export const uploadPlantilla = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const esDocx =
      file.mimetype === DOCX_MIME && file.originalname.toLowerCase().endsWith('.docx')
    callback(null, esDocx)
  },
})
