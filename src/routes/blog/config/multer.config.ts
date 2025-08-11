import { memoryStorage } from 'multer'; // Change from diskStorage to memoryStorage
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  storage: memoryStorage(), // Use memoryStorage for in-memory file buffer
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf|docx|doc|xls|xlsx|ppt|pptx)$/i)) {
      return callback(
        new BadRequestException('Only image and document files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    fieldSize: 50 * 1024 * 1024, // 50MB per field
    fieldNameSize: 1000, // Field name size
    fields: 200, // Max number of fields
    files: 50, // Max number of files
    parts: 1000, // Max number of parts
  },
};