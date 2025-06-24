import { Injectable } from '@nestjs/common';
import { Model, Document } from 'mongoose';

@Injectable()
export class SlugGeneratorService {
  async generateSlug(text: string): Promise<string> {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  async ensureUniqueSlug<T extends Document>(
    text: string,
    model: Model<T>,
    existingId?: string
  ): Promise<string> {
    let baseSlug = await this.generateSlug(text);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: any = { slug };
      if (existingId) {
        query._id = { $ne: existingId };
      }

      const existing = await model.findOne(query);
      if (!existing) return slug;
      slug = `${baseSlug}-${counter++}`;
    }
  }
}

export async function handleSlug<T extends Document>(
  doc: T,
  field: keyof T,
  model: Model<T>
): Promise<string> {
  const generator = new SlugGeneratorService();
  const textValue = String(doc[field]);
  return generator.ensureUniqueSlug(textValue, model, doc._id as string | undefined);
}