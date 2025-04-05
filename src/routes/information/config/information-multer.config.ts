import { MulterModuleOptions } from '@nestjs/platform-express';  // Keep this import
import { diskStorage } from 'multer';
import { extname } from 'path';

export const InformationMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
};
