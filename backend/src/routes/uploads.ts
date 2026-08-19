import { createHash } from 'crypto';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 10,
  },
});

type UploadedFileSummary = {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
};

function summarizeFile(file: Express.Multer.File): UploadedFileSummary {
  return {
    fieldName: file.fieldname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    sha256: createHash('sha256').update(file.buffer).digest('hex'),
  };
}

router.get('/health', (_req, res) => {
  res.json({ success: true, maxFileSizeBytes: 25 * 1024 * 1024 });
});

router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'Expected one multipart file in the "file" field.',
    });
    return;
  }

  res.status(201).json({
    success: true,
    files: [summarizeFile(req.file)],
    receivedAt: new Date().toISOString(),
  });
});

router.post('/multiple', upload.array('files', 10), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Expected multipart files in the "files" field.',
    });
    return;
  }

  res.status(201).json({
    success: true,
    files: files.map(summarizeFile),
    receivedAt: new Date().toISOString(),
  });
});

export default router;
