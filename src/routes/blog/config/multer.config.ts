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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};