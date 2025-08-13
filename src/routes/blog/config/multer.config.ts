import { memoryStorage } from 'multer'; // Change from diskStorage to memoryStorage
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    callback(null, true); // Accept all files for now
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
    fields: 50,
  },
};