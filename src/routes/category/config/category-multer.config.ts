// src/category/config/category-multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

export const categoryMulterOptions = {
  storage: diskStorage({
    destination: './uploads/categories',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `category-${uniqueSuffix}${extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|jpg|gif)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG/PNG/GIF images allowed'), false);
    }
  }
};