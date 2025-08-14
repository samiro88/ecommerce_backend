import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request method:', req.method);
    console.log('Request body:', req.body); 

    // 1. Skip validation for methods that don't typically have a body
    const methodsWithoutBody = ['GET', 'DELETE'];
    if (methodsWithoutBody.includes(req.method)) {
      return next();
    }

    // 2. Skip validation for file upload endpoints
    if (req.originalUrl.includes('/upload/') || req.originalUrl.includes('new-with-file') || req.originalUrl.includes('update-with-file')) {
      return next();
    }

    // 3. Skip validation for recommendation endpoint
    if (req.originalUrl.includes('/products/recommendation')) {
      return next();
    }

    // 3. Check if body exists
    if (!req.body) {
      throw new BadRequestException('Request body is missing');
    }

    let { categoryId, subCategoryIds } = req.body;

    // 4. Parse subCategoryIds if it's a JSON string
    if (typeof subCategoryIds === 'string') {
      try {
        subCategoryIds = JSON.parse(subCategoryIds);
        req.body.subCategoryIds = subCategoryIds; // Update the request body
      } catch {
        subCategoryIds = [];
        req.body.subCategoryIds = [];
      }
    }

    // 5. Validate that at least one ID is provided (make optional)
    // Remove this strict requirement - allow products without categories
    // if (!categoryId && !subCategoryIds) {
    //   throw new BadRequestException('Either categoryId or subCategoryIds must be provided');
    // }

    // 6. Validate categoryId if provided
    if (categoryId && !Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }

    // 7. Validate subCategoryIds array if provided
    if (subCategoryIds && subCategoryIds.length > 0) {
      if (!Array.isArray(subCategoryIds)) {
        throw new BadRequestException('subCategoryIds must be an array');
      }
      const invalidIds = subCategoryIds.filter(id => !Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException('One or more subcategory IDs are invalid');
      }
    }

    // If everything is valid, proceed to the next middleware/controller
    next();
  }
}
