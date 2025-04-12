// shared/utils/generators/slug/slug-generator.service.ts
import { Model, Document } from 'mongoose';
// src/shared/utils/generators/slug/slug-generator.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugGeneratorService {
  // service implementation
}
export async function handleSlug<T extends Document>(
  doc: T,
  field: keyof T,
  model: Model<T>
): Promise<string> {
  const baseSlug = String(doc[field])
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await model.findOne({ slug, _id: { $ne: doc._id } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}
