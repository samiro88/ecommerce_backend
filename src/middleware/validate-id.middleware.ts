import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { categoryId, subCategoryIds } = req.body;

    // 1. Validate categoryId (same logic)
    if (categoryId && !Types.ObjectId.isValid(categoryId)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        message: "Invalid category ID format" 
      });
    }

    // 2. Validate subCategoryIds array (same logic)
    if (subCategoryIds?.some((id) => !Types.ObjectId.isValid(id))) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        message: "Invalid subcategory ID format" 
      });
    }

    next();
  }
}