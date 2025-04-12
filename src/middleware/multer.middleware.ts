import { Injectable, NestMiddleware } from '@nestjs/common';
import * as multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include fileValidationError
declare module 'express' {
  export interface Request {
    fileValidationError?: string;
  }
}

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  private readonly upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false); // Simply reject the file without error
        // Alternatively, you can set an error message on the request
        req.fileValidationError = 'Only image files are allowed';
      }
    },
  });

  // Main middleware handler
  use(req: Request, res: Response, next: NextFunction) {
    this.upload.any()(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error occurred' });
      }
      if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
      }
      next();
    });
  }

  // Specific upload configurations
  static get productImages() {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
          req.fileValidationError = 'Only image files are allowed';
        }
      },
    }).fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]);
  }

  static get slidesImages() {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
          req.fileValidationError = 'Only image files are allowed';
        }
      },
    }).fields([{ name: 'images' }]);
  }
}