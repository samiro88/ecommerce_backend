// src/shared/utils/slug/slug.service.ts
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Document } from 'mongoose';

@Injectable()
export class SlugService {
  /**
   * Converts a string to a URL-friendly slug (identical to original)
   */
  slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')  // Preserved original regex
      .replace(/[\s_-]+/g, '-')  // Same space/underscore handling
      .replace(/^-+|-+$/g, '');  // Same leading/trailing dash removal
  }

  /**
   * Generates a unique slug (matches original logic exactly)
   */
  async generateUniqueSlug<T extends Document>(
    text: string,
    model: Model<T>,
    existingId: string = null
  ): Promise<string> {
    let slug = this.slugify(text);
    let counter = 1;
    let uniqueSlug = slug;

    while (true) {
      const query: any = { slug: uniqueSlug };
      if (existingId) {
        query._id = { $ne: existingId }; // Preserved $ne check
      }

      const existingDocument = await model.findOne(query);

      if (!existingDocument) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  /**
   * Handles slug creation/updates (identical to original)
   */
  async handleSlug<T extends Document>(
    document: T,
    fieldName: keyof T,
    model: Model<T>
  ): Promise<string> {
    if (!document[fieldName]) {
      throw new Error(`${String(fieldName)} is required to generate slug`);
    }

    // Preserved original modification check logic
    if (!document['slug'] || document.isModified(fieldName)) {
      return this.generateUniqueSlug(
        document[fieldName].toString(),
        model,
        document._id
      );
    }

    return document['slug'];
  }
}