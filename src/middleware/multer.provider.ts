import { Provider } from '@nestjs/common';
import * as multer from 'multer';

export const MulterProvider: Provider = {
  provide: 'MULTER_CONFIG',
  useFactory: () => ({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }),
};